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

	var url = "http://interactive.guim.co.uk/docsdata/1MwBCUDPSQufh_eYih8NcQzNXHIPjZ5kf9rrRlREmXBE.json";

	$.getJSON(url, function(spreadsheet){

		data = spreadsheet.sheets.Sheet1;
		buildTaxcuts(data);

	});

}

function formatNumber(num) {
        //console.log("num",num);

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


function buildTaxcuts(data) {
	var total = 0;
	var taxItems,spendingItems;
	var revenue = 0;
	var spending = 0;
	var moneyPool = 0;

	$.each(data, function(i,v) {
		v.amount = +v.amount;
		v.textAmount = formatNumber(v.amount);
		total = total + v.amount;
		v.status = 'out';
		v.statusText = 'rule in';
		
	});

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

	console.log(data,taxItems);

	var ractive = new Ractive({
	el: '#container',
	data: {
		taxItems: taxItems,
		spendingItems: spendingItems,
		total: total,
		moneyPool: moneyPool,
		revenue: revenue,
		spending: spending,
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

