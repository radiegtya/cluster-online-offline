//var offlineConn = DDP.connect("http://localhost:3000");
//Ground.Collection(Posts);

if (Meteor.isClient) {
    var options = {
        keepHistory: 1000 * 60 * 5,
        localSearch: true
    };
    var fields = ['name'];

    PostsSearch = new SearchSource('posts', fields, options);
    var status = PostsSearch.getStatus();
    console.log(status)

    Template.hello.helpers({
        getPosts: function() {
            return PostsSearch.getData({
                transform: function(matchText, regExp) {
                    return matchText.replace(regExp, "<b>$&</b>")
                },
                sort: {}
            });
        },
        isLoading: function() {
            return PostsSearch.getStatus().loading;
        }
    });

    Template.hello.events({
        'click button': function() {
            Meteor.call('insertPost', {name: Math.random().toString(36).substring(7)});
        }
    });
}

if (Meteor.isServer) {
//    var offlineConn = Cluster.discoverConnection('offline');  
    Cluster.connect("mongodb://localhost:27017/discovery");
    Cluster.register("online");
    offlineConn = Cluster.discoverConnection('web');
    Posts = new Mongo.Collection('posts', offlineConn);
//    Ground.Collection(Posts);
//    offlineConn.subscribe('posts');

    SearchSource.defineSource('posts', function(searchText, options) {
        var options = {};

        var models = [];
        if (searchText) {
            var regExp = buildRegExp(searchText);
            var selector = {name: regExp};
            models = Posts.find(selector, options).fetch();
        } else {
            models = Posts.find({}, options).fetch();
        }
        console.log(models)
        return models;
    });

    function buildRegExp(searchText) {
        // this is dumb implementation
        var parts = searchText.trim().split(' ');
        return new RegExp("(" + parts.join('|') + ")", "ig");
    }

    Meteor.methods({
        insertPost: function(doc) {
            Posts.insert(doc, function(err, res) {
                if (err)
                    console.log(err)
            });
        }
    })

// access data
//    console.log(Posts.find().fetch())
}
