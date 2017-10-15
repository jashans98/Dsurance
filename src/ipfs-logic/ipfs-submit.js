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
			return toReturn;
})}

//EXAMPLE:
//sendFileToIPFS(new Buffer("helloWorld")); //Returns a hash

return toReturn;

module.exports =	{
	addFileToIPFS,
	sendFileToIPFS,
}