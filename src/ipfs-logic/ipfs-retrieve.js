//IPFS IMPORT
var ipfsAPI = require('ipfs-api');

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

var retrieveFileToIPFS = (hash) => {
	getFileFromIPFS(hash)
		.then((stream) => {
			stream.on('data', (file) => {
				const data = file.content.read().toString();
				return data;
		});
})}

module.exports = function(hash)	{ return retrieveFileToIPFS(hash) }
