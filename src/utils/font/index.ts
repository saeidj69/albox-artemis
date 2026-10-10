import localFont from 'next/font/local'

const IranSans = localFont({
  src: [
    // {
    //   path: './IRANSansXFaNum-Thin.woff2',
    //   weight: '100',
    //   style: 'normal',
    // },
    // {
    //   path: './IRANSansXFaNum-UltraLight.woff2',
    //   weight: '200',
    //   style: 'normal',
    // },
    {
      path: '../../assets/fonts/IRANSansXFaNum-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../assets/fonts/IRANSansXFaNum-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../assets/fonts/IRANSansXFaNum-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../assets/fonts/IRANSansXFaNum-DemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../assets/fonts/IRANSansXFaNum-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    // {
    //   path: './IRANSansXFaNum-ExtraBold.woff2',
    //   weight: '800',
    //   style: 'normal',
    // },
    // {
    //   path: './IRANSansXFaNum-Heavy.woff2',
    //   weight: '850',
    //   style: 'normal',
    // },
    // {
    //   path: './IRANSansXFaNum-Black.woff2',
    //   weight: '900',
    //   style: 'normal',
    // },
    // {
    //   path: './IRANSansXFaNum-ExtraBlack.woff2',
    //   weight: '950',
    //   style: 'normal',
    // },
  ],
  display: 'swap',
  variable: '--font-iransans',
  preload: true,
})

export { IranSans }
