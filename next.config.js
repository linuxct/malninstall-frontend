module.exports = {
    publicRuntimeConfig: {
        siteMetaData: {
            name: "Malninstall Package Generator",
            url: process.env.NODE_ENV === "development" ? "http://localhost:3000" : "/",
            title: "Malninstall Package Generator",
            description: "Generate a package to remove malware from your Android device, right from your web browser",
            twitterHandle: "linuxct",
            socialPreview: "/images/preview.png",
        },
        apiBaseUrl: "https://malninstall-configuration.linuxct.space"
    },
    i18n: {
        locales: ["en-GB"],
        defaultLocale: "en-GB",
    },
};