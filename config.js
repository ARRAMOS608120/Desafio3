export default {
    fileSystem: {
        path: './'
    },
    mongodb: {
        cnxStr: '',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
           // useCreateIndex: true,
            serverSelectionTimeoutMS: 1000,
        }
    },
    firebase:{
        "type": "service_account",
        "project_id": "",
        "private_key_id": "",
        "private_key": ""
        "client_id": "",
        "auth_uri": "",
        "token_uri": "",
        "auth_provider_x509_cert_url": "",
        "client_x509_cert_url": ""
      }      
}
