################
# Dependencies #
################
FROM reg.allbox.work/base-images/node:22-bookworm-slim AS deps

ARG NPM_MIRROR
ARG APT_MIRROR

RUN apt-get clean && \
    if [ -n "$APT_MIRROR" ]; then \
        rm -f /etc/apt/sources.list.d/debian.sources && \
        echo "deb $APT_MIRROR bookworm main" > /etc/apt/sources.list && \
        echo "deb-src $APT_MIRROR bookworm main" >> /etc/apt/sources.list; \
    fi && \
    apt-get update && \
    apt-get install -y libc6 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Use custom npm registry if provided
RUN (if [ -n "$NPM_MIRROR" ]; then npm set registry "$NPM_MIRROR"; fi)

RUN corepack enable && corepack prepare pnpm@11.1.3 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod=false --ignore-scripts

###########
# Builder #
###########
FROM reg.allbox.work/base-images/node:22-bookworm-slim AS builder

ARG DEPLOYMENT_TAG=""
ARG GIT_SHA=""

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.1.3 --activate

COPY --from=deps /app/node_modules ./node_modules

COPY . .

ENV API_URL=https://api-allbox.surenamarkets.com
ENV TYCHE_API_URL=https://api-allbox.surenamarkets.com/tyche
ENV APP_URL=https://allbox.surenamarkets.com
ENV MAPSI_BASE_URL=https://allbox.surenamarkets.com/mapsi/api/v1
ENV VAPID_PUBLIC_KEY=
ENV DEPLOYMENT_TAG=$DEPLOYMENT_TAG
ENV TUTORIAL_VIDEO_URL=https://allbox.surenamarkets.com/_media/customer_onboarding.mp4
ENV TUTORIAL_VIDEO_POSTER_URL=https://allbox.surenamarkets.com/_media/customer_onboarding_thumb.jpg
ENV SUPPORT_PHONE_NUMBER=02142416000
ENV PLAUSIBLE_URL=https://plausible.allbox.market/js/pa-xpO7CN5Qdi0O-4SF7XtCF.js
ENV WEBENGAGE_ID=
ENV APP_ENV=production
ENV SENTRY_TRACES_SAMPLE_RATE=0.02

ENV CLARITY_ID=x2ns4x5ud6
ENV GTM_ID=GTM-PP634P9G
ENV CASHBACK_PERCENT=1
ENV NEXT_TELEMETRY_DISABLED=1

# Sentry auth token comes in as a BuildKit secret so it never lands in an image layer.
RUN --mount=type=secret,id=sentry_auth_token \
    SENTRY_AUTH_TOKEN="$(cat /run/secrets/sentry_auth_token 2>/dev/null || true)" \
    pnpm run build

##########
# Runner #
##########
FROM reg.allbox.work/base-images/node:22-bookworm-slim AS runner

WORKDIR /app


RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
