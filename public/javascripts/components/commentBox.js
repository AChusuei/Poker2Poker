define(['React'], 
function(React) {

	var CommentBox = React.createClass({
      render: function() {
        return (
          <div className="commentBox">
            Hello, world! I am a CommentBox.
          </div>
        );
      }
    });

	var renderCB = function(document) {
		React.renderComponent(<CommentBox />, document.getElementById('testReact'));
	}

    return {
    	renderCB: renderCB,
    }

});