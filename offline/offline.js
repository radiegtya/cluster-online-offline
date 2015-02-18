
Posts = new Mongo.Collection('posts');

if (Meteor.isClient) {
    Meteor.subscribe('posts');

    Template.hello.helpers({
        posts: function() {
            return Posts.find();
        }
    });

    Template.hello.events({
        'click button': function() {
            Meteor.call('Posts.insert', {name: Math.random().toString(36).substring(7)})
        }
    });
}

if (Meteor.isServer) {
    Cluster.connect("mongodb://localhost:27017/discovery");
    Cluster.register("web");
//    Cluster.allowPublicAccess("web");
    // web app
    Meteor.publish('posts', function() {
        return Posts.find({});
    });

    Meteor.methods({
        "Posts.insert": function(doc) {
            Posts.insert(doc);
        },
    });
}
