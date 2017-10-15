(function() {
 'use strict';

 angular.module('application', [
	 'ui.router',
	 'ngAnimate',

	 //foundation
	 'foundation',
	 'foundation.dynamicRouting',
	 'foundation.dynamicRouting.animations'
	 ]) .controller('MainController', function($scope, $log, $state, $http) {
		 this.networks = [];
		 var counter = 0;
		 this.claim_title = "";
		 this.at_fault = "";
		 this.relief_amount = "";
		 this.loss_type = "";
		 this.network_index = "";
		 this.submit_claim = function(){
			var claim = this.network_index+ "," +this.claim_title + "," + this.at_fault + "," +  this.relief_amount + "," + this.loss_type;
			console.log("SUBMITTING "+claim);
		}
		 this.addNetwork = function(){
		 this.networks = this.networks.concat([{name:counter.toString(),content:"0 participants"}])
		 console.log("ADDED NETWORK "+counter.toString());
		 counter++;
		 };
		 })
	 .config(config)
	 .run(run)
	 ;

 config.$inject = ['$urlRouterProvider', '$locationProvider'];

 function config($urlProvider, $locationProvider) {
	 $urlProvider.otherwise('/');

	 $locationProvider.html5Mode({
enabled:false,
requireBase: false
});

$locationProvider.hashPrefix('!');
}

function run() {
	FastClick.attach(document.body);
}

})();
