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
		EscrowApp.init(console.log);

		//BLOCKCHAIN ACCNT DEETS
		this.address = "?";
		this.eth_balance = 0;

		//LOCAL
		var counter = 0;
		var count = 0;
		var parent = this;
		//GLOBAL
		this.networks = [];
		this.claim_title = "";
		this.at_fault = "";
		this.relief_amount = "";
		this.loss_type = "";
		this.network_index = "";
		this.participants = [];
		this.in_or_out = "Join";

		this.full_name = "";
		this.occupation = "";
		this.investment_amount = "";
		
		this.getP = function(name){			
			return this.participants[parseInt(name)];
		}

		/*
		 * FUNCTIONS
		 */
		this.submit_claim = function(){

			var claim = this.network_index+ "," +this.claim_title + "," + this.at_fault + "," +  this.relief_amount + "," + this.loss_type;
			console.log("SUBMITTING "+claim);
		}
		this.addNetwork = function(){
			EscrowApp.createGroup();
			EscrowApp.countGroups(function(count){
				counter = count;
				console.log("ADDED NETWORK "+counter.toString());
				parent.render();
			});
		};
		this.render = function(){
			EscrowApp.countGroups(function(count) {
				parent.participants = []
				for (var i = 0; i<count;i++){
					parent.networks[i] = {name:i,content:"Network is healthy..."};
					EscrowApp.numUsersInGroup(i, function(num) {
						parent.participants.push(num);
						console.log(parent.participants.toString());
					});
				}
			});
		}
		
		setInterval(this.render, 60000);

		this.submit_inv_application = function() {
			var investment = this.investment_amount;
			console.log("INVESTING " + investment);	
		};

		this.join_net = function(name) {
			EscrowApp.registerForInsuranceGroup(parseInt(name));
			this.in_or_out = "Leave";
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
