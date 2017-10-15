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
		//BLOCKCHAIN ACCNT DEETS
		this.address = "?"
		this.eth_balance = 0

		//LOCAL
		var counter = 0;
		//GLOBAL
		this.networks = [];
		this.claim_title = "";
		this.at_fault = "";
		this.relief_amount = "";
		this.loss_type = "";
		this.network_index = "";
		
		this.full_name = "";
		this.occupation = "";
		this.investment_amount = "";

		/*
		 * FUNCTIONS
		 */
		this.submit_claim = function(){
			var claim = this.network_index+ "," +this.claim_title + "," + this.at_fault + "," +  this.relief_amount + "," + this.loss_type;
			console.log("SUBMITTING "+claim);
		}
		this.addNetwork = function(){
			this.networks = this.networks.concat([{name:counter.toString(),content:"0 participants"}])
				console.log("ADDED NETWORK "+counter.toString());
			counter++;
		};
		this.submit_inv_application = function() {
			var investment = this.investment_amount;
		  	console.log("INVESTING " + investment);	
		};
	}).config(config).run(run);

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
