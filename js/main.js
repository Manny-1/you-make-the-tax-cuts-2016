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



function init() {

	//get spreadsheet data

	var url = "http://interactive.guim.co.uk/docsdata/1MwBCUDPSQufh_eYih8NcQzNXHIPjZ5kf9rrRlREmXBE.json";

	$.getJSON(url, function(spreadsheet){

		data = spreadsheet.sheets.Sheet1;
		buildTaxcuts(data);

	});

}

function formatNumber(num){
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

        return [num];
    }


function buildTaxcuts(data) {
	var total = 0;
	var taxItems,spendingItems;
	var moneyPool = 0;

	$.each(data, function(i,v) {
		v.amount = +v.amount;
		v.textAmount = formatNumber(v.amount);
		total = total + v.amount;
		v.status = 'out';
		
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
		moneyPool: moneyPool
		},
	template: '#template'
	});

	ractive.on( 'toggleItem', function (event) {

		console.log(event.context);

		if (event.context.status === 'out') {
			console.log('out')
			ractive.set(event.keypath + '.status','in')
			moneyPool = moneyPool + event.context.amount;
			console.log(moneyPool);
		}

		else if (event.context.status === 'in') {
			console.log('in')
			ractive.set(event.keypath + '.status','out')
			moneyPool = moneyPool - event.context.amount;
			console.log(moneyPool);
		}
		
	});

}

init();

