//Filter polyfill

if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun/*, thisArg*/) {
    'use strict';

    if (this === void 0 || this === null) {
      throw new TypeError();
    }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== 'function') {
      throw new TypeError();
    }

    var res = [];
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
      if (i in t) {
        var val = t[i];

        // NOTE: Technically this should Object.defineProperty at
        //       the next index, as push can be affected by
        //       properties on Object.prototype and Array.prototype.
        //       But that method's new, and collisions should be
        //       rare, so use the more-compatible alternative.
        if (fun.call(thisArg, val, i, t)) {
          res.push(val);
        }
      }
    }

    return res;
  };
}

iframeMessenger.enableAutoResize();




function init() {

	//get spreadsheet data

	var url = "https://interactive.guim.co.uk/docsdata/1dWJohsLU1Rm-0yeJI9sxjGmzopQBrfME4NKY0xNtRQg.json";

	$.getJSON(url, function(spreadsheet){

		data = spreadsheet.sheets.Sheet1;
		buildTaxcuts(data);

	});

}

function formatNumber(num) {

        //check if num is positive or negative

        if ( num > 0 ) {
            if ( num > 1000000000 ) return "$" + ( num / 1000000000 ).toFixed(1) + 'bn';
            if ( num > 1000000 ) return "$" + ( num / 1000000 ).toFixed(1) + 'm';
            
        }
        
        if ( num < 0 ) {
            var posNum = num * -1;
            if ( posNum > 1000000000 ) return [String(( posNum / 1000000000 )) + 'bn'];
            if ( posNum > 1000000 ) return [String(( posNum / 1000000 )) + 'm'];

        }

        return num;
    }

//Hash url - store custom ministry values in url hash

function hashUrl() {

	var linkURL,tweetLinkURL;
	var tempList = [];

	ministry.forEach(function(d,i){
		tempList.push(d['polID']+'-'+d['minID']);
	});

	urlString = "#" + tempList.join(",");

	// var linkURL,tweetLinkURL;

	if ( window.self !== window.top ) {
		iframeMessenger.navigate(urlString);
		iframeMessenger.getLocation(function(parLocation) {
		linkURL = parLocation['origin'] + parLocation['pathname'] + "%23" + tempList.join(",");
		tweetLinkURL = "https://twitter.com/intent/tweet?text=Here's+my+ideal+new+parliamentary+cabinet+&url=" + linkURL;	
		$("#tweet").attr("href", tweetLinkURL);
	});

	}

	else {
		window.location.hash = urlString;
		linkURL = window.location.origin + window.location.pathname + "%23" + tempList.join(",");
		tweetLinkURL = "https://twitter.com/intent/tweet?text=Here's+my+ideal+new+parliamentary+cabinet&url=" + linkURL;	
		$("#tweet").attr("href", tweetLinkURL);
	}

}

function parseHash() {

	if (window.self !== window.top) {
	 iframeMessenger.getLocation(function(parLocation){
	   var urlHash = parLocation['hash'];
	   if (urlHash != "" && urlHash != "#?") {
			urlHash = urlHash.replace("#?","");
		    hashData = urlHash.split(",");
		    return hashData;
	   }
	   else {
	   		return null;
	   }

	 });
   	}
   	else {
	   var urlHash = location.hash;
	   console.log(urlHash);
	   if (urlHash != "" && urlHash != "#?") {
			urlHash = urlHash.replace("#?","");
			hashData = urlHash.split(",");
			return hashData;
	   }

	   else {
	   	return null;
	   }
	}

};

function buildTaxcuts(data) {

	var total = 0;
	var taxItems,spendingItems;
	var revenue = 0;
	var spending = 0;
	var moneyPool = 0;
	var groupTitles = [];
	var hashData = parseHash();
 	var hashList = [];
 	var groupHashList = [];
 	var groupStatus = {};
 	var hashStatus = false;
 	var origData = jQuery.extend({}, data);

 	if (hashData != null) {
 		hashStatus = true;
 	};

	function hashUrl(data) {

		var urlString = "#?" + data.join(",");

		// var linkURL,tweetLinkURL;

		if ( window.self !== window.top ) {
			iframeMessenger.navigate(urlString);
			iframeMessenger.getLocation(function(parLocation) {
			linkURL = parLocation['origin'] + parLocation['pathname'] + "%23" + data.join(",");
			tweetLinkURL = "https://twitter.com/intent/tweet?text=Here's+my+ideal+new+parliamentary+cabinet+&url=" + linkURL;	
			$("#tweet").attr("href", tweetLinkURL);
		});

		}

		else {
			window.location.hash = urlString;
			linkURL = window.location.origin + window.location.pathname + "%23" + data.join(",");
			tweetLinkURL = "https://twitter.com/intent/tweet?text=Here's+my+ideal+new+parliamentary+cabinet&url=" + linkURL;	
			$("#tweet").attr("href", tweetLinkURL);
		}

	}

 	function updateHashList(n,action) {
 		if (action === 'add') {
 			hashList.push(n);
 		}
 		else if (action === 'remove') {
 			var i = hashList.indexOf(n);
			if(i != -1) {
				hashList.splice(i, 1);
			}
 		}
 		console.log(hashList);
 		hashUrl(hashList);
 	}

	console.log("hashData", hashData);


	function setupData(data) {
		$.each(data, function(i,v) {
		v.amount = +v.amount;
		v.textAmount = formatNumber(v.amount);
		total = total + v.amount;
	
		v.id = i;
		if (v.group != "") {
			if (groupTitles.indexOf(v.group) == -1) {
				groupTitles.push(v.group);
			}
		};

		//Handle hash data from the URL 

		if (hashData != null) {

			if (hashData.indexOf(String(i)) != -1) {
				v.status = 'in';
				v.statusText = 'rule out';
				if (v.group != "") {
					groupHashList.push({"id":v.id,"group":v.group})	
				}
				}
			else {
				v.status = 'out';
				v.statusText = 'rule in';
			}
		}

		else {
			v.status = 'out';
			v.statusText = 'rule in';
		}
		
		});
	

		console.log("groupTitles",groupTitles);
		console.log("groupHashList",groupHashList);

		groupTitles.forEach( function(title) {
				groupStatus[title] = true;
		});

		if (hashData != null) {
			groupHashList.forEach(function(groupHash) {
				data.forEach( function(d) {
					if (d.group === groupHash.group) {
						if (d.id != groupHash.id) {
							d.status = 'unavailable';
							d.statusText = 'unavailable';
						}
					}
				});

			groupStatus[groupHash.group] = false;	
			});
		};

		console.log("groupStatus",groupStatus);

		taxItems = data.filter(function(d) {
			if (d.type === 'tax') {
				return d;
			}
		});

		spendingItems = data.filter(function(d) {
			if (d.type === 'spending') {
				return d;
			}
		});

		if (hashData != null) {
			taxItems.forEach(function(d) {
				if (hashData.indexOf(String(d.id)) != -1) {
						revenue = revenue + d['amount'];
						moneyPool = moneyPool + d['amount'];
					};
			});

			spendingItems.forEach( function(d) {
			if (hashData.indexOf(String(d.id)) != -1) {
					spending = spending + d['amount'];
					moneyPool = moneyPool - d['amount'];
				};
			})

		}

	}	

	setupData(data);

	var ractive = new Ractive({
	el: '#container',
	data: {
		taxItems: taxItems,
		spendingItems: spendingItems,
		total: total,
		moneyPool: moneyPool,
		hashStatus: hashStatus,
		revenue: revenue,
		spending: spending,
		groupStatus: groupStatus,
		format: function (num) {

        if ( num > 0 ) {
            if ( num > 1000000000 ) return "$" + ( num / 1000000000 ).toFixed(1) + 'bn';
            if ( num > 1000000 ) return "$" + ( num / 1000000 ).toFixed(1) + 'm';
            else return "$" + String(num) ;
        }

        if ( num < 0 ) {
            var posNum = num * -1;
            if ( posNum > 1000000000 ) return "$-" + (posNum / 1000000000 ).toFixed(1) + 'bn';
            if ( posNum > 1000000 ) return "$-" + (posNum / 1000000 ).toFixed(1) + 'm';
            else return "$-" + String(posNum) ;
        }

        else return "$" + String(num) ;

    	},
    	moneyFormat: function (num) {
    		if (num < 0) {
    			return (num * -1) / total * 50 
			}
			else {
				return (num / total )*50 
			} 

    	},
    	moneyPos: function (num) {
    		if (num > 0) {
    			return  String(50 - (num  / total * 50)) + "%"
			}
			else {
				return '50%'
			} 
    	},
    	moneyClass: function(num) {
    		if (num > 0) {
    			return  'black'
			}
			else {
				return 'red'
			} 
    	}
		},
	template: '#template'
	});

	ractive.on( 'resetPage', function (event) { 
		if ( window.self !== window.top ) {
			iframeMessenger.navigate('/');
			iframeMessenger.getLocation(function(parLocation) {
			linkURL = parLocation['origin'] + parLocation['pathname'] + "%23" + data.join(",");
			tweetLinkURL = "https://twitter.com/intent/tweet?text=Here's+my+ideal+new+parliamentary+cabinet+&url=" + linkURL;	
			$("#tweet").attr("href", tweetLinkURL);
		});

		}
		else {
			window.location.hash = '?';
			linkURL = window.location.origin + window.location.pathname + "%23" + data.join(",");
			tweetLinkURL = "https://twitter.com/intent/tweet?text=Here's+my+ideal+new+parliamentary+cabinet&url=" + linkURL;	
			$("#tweet").attr("href", tweetLinkURL);
		}

		location.reload();
	});

	ractive.on( 'toggleItem', function (event) {

		console.log(event.context);

		//check if tax or spending

		if (event.context.type === 'tax') {

				console.log('tax');

				if (event.context.status === 'out') {
				console.log('out')
				ractive.set(event.keypath + '.status','in')
				ractive.set(event.keypath + '.statusText','rule out')
				moneyPool = moneyPool + event.context.amount;
				ractive.animate('moneyPool',moneyPool);
				revenue = revenue + event.context.amount;
				ractive.animate('revenue',revenue);
				console.log(moneyPool);
				console.log(taxItems);
				updateHashList(event.context.id,'add');
			}

			else if (event.context.status === 'in') {
				console.log('in')
				ractive.set(event.keypath + '.status','out')
				ractive.set(event.keypath + '.statusText','rule in')
				moneyPool = moneyPool - event.context.amount;
				ractive.animate('moneyPool',moneyPool);
				ractive.set('moneyPool',moneyPool);
				revenue = revenue - event.context.amount;
				ractive.animate('revenue',revenue);
				console.log(moneyPool);
				updateHashList(event.context.id,'remove');
			}
			
		}

		if (event.context.type === 'spending') {

				console.log('spending');
			
				if (event.context.status === 'out') {
				console.log('out')
				ractive.set(event.keypath + '.status','in')
				ractive.set(event.keypath + '.statusText','rule out')
				moneyPool = moneyPool - event.context.amount;
				ractive.animate('moneyPool',moneyPool);
				spending = spending + event.context.amount;
				ractive.animate('spending',spending);
				console.log(moneyPool);
				updateHashList(event.context.id,'add');
			}

			else if (event.context.status === 'in') {
				console.log('in')
				ractive.set(event.keypath + '.status','out')
				ractive.set(event.keypath + '.statusText','rule in')
				moneyPool = moneyPool + event.context.amount;
				ractive.animate('moneyPool',moneyPool);
				spending = spending - event.context.amount;
				ractive.animate('spending',spending);
				console.log(moneyPool);
				updateHashList(event.context.id,'remove');
			}


		}  
		
	});

	ractive.on( 'toggleItemGroup', function (event) {
		console.log(event.context);
		console.log("toggleItemGroup");

		//has anythin in the group been selected?

		if (groupStatus[event.context.group] == true) {

			if (event.context.status === 'out') {
				console.log('out')
				ractive.set(event.keypath + '.status','in')
				ractive.set(event.keypath + '.statusText','rule out')
				moneyPool = moneyPool + event.context.amount;
				ractive.animate('moneyPool',moneyPool);
				revenue = revenue + event.context.amount;
				ractive.animate('revenue',revenue);
				console.log(moneyPool);
				groupStatus[event.context.group] = false;
				
				taxItems.forEach( function (item) {
					if (item['group'] === event.context.group && item['id'] != event.context.id) {
						console.log(item);
						item['status'] = "unavailable";
						item['statusText'] = "unavailable";
					}
				});
				ractive.set('taxItems',taxItems);
				updateHashList(event.context.id,'add');

			}
		}

		else if (groupStatus[event.context.group] == false) {

			if (event.context.status === 'in') {
				console.log('in')
				ractive.set(event.keypath + '.status','out')
				ractive.set(event.keypath + '.statusText','rule in')
				moneyPool = moneyPool - event.context.amount;
				ractive.animate('moneyPool',moneyPool);
				ractive.set('moneyPool',moneyPool);
				revenue = revenue - event.context.amount;
				ractive.animate('revenue',revenue);
				console.log(moneyPool);
				groupStatus[event.context.group] = true;

				taxItems.forEach( function (item) {
					if (item['group'] === event.context.group && item['id'] != event.context.id) {
						console.log(item);
						item['status'] = "out";
						item['statusText'] = "rule in";
					}
				});
				ractive.set('taxItems',taxItems);
				updateHashList(event.context.id,'remove');
			
			}

			else if (event.context.status === 'unavailable') {
				console.log('unavailable');
			}


		}


	});	
	

	
	//Sticky nav within iframe

	if (window!=window.top) { 

		var $end = $('#end');
		var $sticky = $('.sticky-bar');

		setInterval(function(){

			iframeMessenger.getPositionInformation(function(data){
			
					var endPoint = $end.position().top
					console.log(endPoint);
					console.log("pageYOffSet", data['pageYOffset'], "iframeTop", data['iframeTop'], "innerHeight", data['innerHeight']);
					console.log(data['innerHeight'] - data['iframeTop']);

						if (data['iframeTop'] < 0 && data['iframeTop'] > (-1*(endPoint-60)) && (data['innerHeight'] - data['iframeTop']) < endPoint) {

							$sticky.css({top: (-1*data['iframeTop']) + data['innerHeight'] - 60 + 'px'})

						}

						else if (data['iframeTop'] > 0 && (data['innerHeight'] - data['iframeTop']) < endPoint) {
							console.log("yeah");
							$sticky.css({top: data['innerHeight'] - data['iframeTop'] - 60})

						}

						else if ((data['innerHeight'] - data['iframeTop']) >= endPoint) {
							$sticky.css({top: 'auto'})
						}

			});

		}, 20);

}

}

init();

