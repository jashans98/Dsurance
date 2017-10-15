//IPFS IMPORT
var ipfsAPI = require('ipfs-api');
var fileDownload = require('react-file-download');

//CREATE INSTANCE
var ipfs = ipfsAPI(
		'ipfs.infura.io',
		'5001',
		{
			protocol: 'https'
		}
	)

function getFileFromIPFS(hash) {
  return ipfs.files.get(hash);
}

var retrieveFileToIPFS = (hash, callback) => {
	getFileFromIPFS(hash)
		.then((stream) => {
			stream.on('data', (file) => {
				const data = file.content.read().toString();
				console.log(data);
				fileDownload(uncrypted, 'download.txt');
		});
})}

module.exports =	{
	getFileFromIPFS,
	retrieveFileToIPFS,
}