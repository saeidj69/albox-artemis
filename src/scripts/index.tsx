import Script from 'next/script'

import { GoogleTagManager } from '@next/third-parties/google'

const gtmId = process.env.GTM_ID
const clarityId = process.env.CLARITY_ID
const webengageId = process.env.WEBENGAGE_ID

const ThirdPartyScripts = () => {
  return (
    <>
      {clarityId && (
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script","${clarityId}");
          `,
          }}
        />
      )}

      {gtmId && <GoogleTagManager gtmId={gtmId} />}

      {webengageId && (
        <Script
          id="_webengage_script_tag"
          type="text/javascript"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
          var webengage;
          !(function (w, e, b, n, g) {
            function o(e, t) {
              e[t[t.length - 1]] = function () {
                r.__queue.push([t.join("."), arguments]);
              };
            }
            var i,
              s,
              r = w[b],
              z = " ",
              l = "init options track screen onReady".split(z),
              a =
                "webPersonalization feedback survey notification notificationInbox".split(
                  z,
                ),
              c = "options render clear abort".split(z),
              p = "Prepare Render Open Close Submit Complete View Click".split(z),
              u = "identify login logout setAttribute".split(z);
            if (!r || !r.__v) {
              for (
                w[b] = r = { __queue: [], __v: "6.0", user: {} }, i = 0;
                i < l.length;
                i++
              )
                o(r, [l[i]]);
              for (i = 0; i < a.length; i++) {
                for (r[a[i]] = {}, s = 0; s < c.length; s++) o(r[a[i]], [a[i], c[s]]);
                for (s = 0; s < p.length; s++) o(r[a[i]], [a[i], "on" + p[s]]);
              }
              for (i = 0; i < u.length; i++) o(r.user, ["user", u[i]]);
              setTimeout(function () {
                var f = e.createElement("script"),
                  d = e.getElementById("_webengage_script_tag");
                ((f.type = "text/javascript"),
                  (f.async = !0),
                  (f.src =
                    ("https:" == e.location.protocol
                      ? "https://ssl.widgets.webengage.com"
                      : "http://cdn.widgets.webengage.com") +
                    "/js/webengage-min-v-6.0.js"),
                  d.parentNode.insertBefore(f, d));
              });
            }
          })(window, document, "webengage");
          webengage.init("${webengageId}");
          `,
          }}
        ></Script>
      )}
    </>
  )
}

export default ThirdPartyScripts
