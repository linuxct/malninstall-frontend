import axios from 'axios'

export default function handler(req, res) {
    const requestData = {
        'entryChannel': 'Web',
        'safetyNetJwt': '',
        'hcaptchaClientResponse': req.body.hcaptcha,
        'packageName': req.body.packagename
    }

    axios.post('https://malninstall-configuration.linuxct.space/PackageCreator/GeneratePackage', requestData)
        .then(function(response) {
            res.status(200).json({ url: response.downloadUrl })
        })
        .catch(function(error) {
            console.log(error);
            res.status(403).json({ err: error })
        });
}