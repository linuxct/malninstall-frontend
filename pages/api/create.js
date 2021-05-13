export default function handler(req, res) {
    console.log(req.body)
    const requestData = {
        'entryChannel': 'Web',
        'safetyNetJwt': '',
        'hcaptchaClientResponse': req.body.hcaptcha,
        'packageName': req.body.packagename
    }
    axios.post('https://malninstall-configuration.linuxct.space/PackageCreator/GeneratePackage', requestData)
        .then(function(response) {
            res.status(200).json({ url: response.downloadUrl })
        });
}