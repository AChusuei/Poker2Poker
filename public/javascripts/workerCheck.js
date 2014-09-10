define(["jquery", "worker!ww/counting.js"], function ($, counter) {
	counter.onmessage = function (event) {
		$("#yourHand").append("<li>message from the background thread: <strong>" + event.data + "</strong></li>");
	};

	$("#doIt").click(function () {
		counter.postMessage("start");
	});
});