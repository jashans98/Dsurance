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


var toReturn = "";

var addFileToIPFS = (data) => {
	return ipfs.files.add(data);
}

function sendFileToIPFS(data){
	addFileToIPFS(data)
		.then(res => {
			const hash = res[0]['hash'];
			console.log('hash', hash);
			//window.LeakApp.handleSubmit(hash); 
			toReturn = hash;
})}

//EXAMPLE:
//sendFileToIPFS(new Buffer("helloWorld")); //Returns a hash

return toReturn;


function getFileFromIPFS(hash) {

  return ipfs.files.get(hash);
}


var retrieveFileToIPFS = (hash, callback) => {
	getFileFromIPFS(hash)
		.then((stream) => {
			stream.on('data', (file) => {
				const data = file.content.read().toString()
				// console.log(encrypted_data);
				console.log(data);

				//fileDownload(uncrypted, 'download.txt');
		});
})}

module.exports =	{
	addFileToIPFS,
	sendFileToIPFS,
}