if('undefined' === typeof window) {
	importScripts('require.js');
}

require({
        baseUrl: ''
    }, ['moment', 'underscore', 'playingCards'], function() {
	
		onmessage = function (event) {
			if (event.data == "start") {
				count();
			}
		}

		function count() {
			var end = 1e8, tmp = 1;
			postMessage("hello there" + moment());
			while (end) {
				end -= 1;
				tmp += end;
				if (end === 5e7) { // 5e7 is the half of 1e8
					postMessage("halfway there, tmp is now " + tmp);
				}
			}
			postMessage("all done at " + moment());
		}

    }
);