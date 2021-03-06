/**
 * Almost al the ticket logic is here:
 * + create a new ticket
 * + filter tickets
 * + find ticket by id
 *
 * ...
 */
(function() {
    angular.module("my-tickets")
        .factory('myTickets', ['CategoriesMocks', 'myUsers', '$http', '$q', myTickets]);

    function myTickets(CategoriesMocks, myUsers, $http, $q) {

        var self = this;
        var lastId = 0;
        var tickets = {};
        var server = false;

        activate();

        return {
            make: make,
            save: save,
            find: find,
            getUserTickets: getUserTickets,
            size: size,
            getNotAssigned: getNotAssigned,
            getClosed: getClosed,
            getMine: getMine,
            setServer: setServer
        };


        function activate() {

        }

        function setServer(status) {
            server = status;
        }

        function getMine() {
            if (server === false) {
                var deferred = $q.defer();
                var mine = [];
                var me = myUsers.getCurrentUser().id;

                var ticket;
                for (var id in tickets) {
                    ticket = tickets[id];
                    if (ticket.it === me && ticket.status === 'open') {
                        mine.push(ticket);
                    }
                }

                deferred.resolve({
                    data: mine
                });

                return deferred.promise;
            } else {
                return $http({
                    method: 'GET',
                    url: 'http://localhost:3030/helpdesk/assigned/' + myUsers.getCurrentUser().id + '?random=' + Math.random()
                });
            }

        }

        function getClosed() {
            if (server === false) {
                var deferred = $q.defer();

                var closed = [];

                var ticket;
                for (var id in tickets) {
                    ticket = tickets[id];
                    if (ticket.status === 'closed') {
                        closed.push(ticket);
                    }
                }

                deferred.resolve({
                    data: closed
                });

                return deferred.promise;
            } else {

                return $http({
                    method: 'GET',
                    url: 'http://localhost:3030/helpdesk/closed?random=' + Math.random()
                });
            }
        }

        function getNotAssigned() {
            if (server === false) {
                var deferred = $q.defer();

                var notAssigned = [];
                for (var id in tickets) {
                    if (tickets[id].it === null) {
                        notAssigned.push(tickets[id]);
                    }
                }
                deferred.resolve({
                    data: notAssigned
                });

                return deferred.promise;
            } else {
                return $http({
                    method: 'GET',
                    url: 'http://localhost:3030/helpdesk/not-assigned?remote=' + Math.random()
                });
            }

        }

        function size() {
            return Object.keys(tickets).length;
        }

        function getUserTickets(userid) {

            if (server === false) {
                var deferred = $q.defer();
                var res = {};
                res.who = [];
                res.evaluate = [];
                res.requested = [];
                var ticket;
                for (var id in tickets) {
                    ticket = tickets[id];
                    if (ticket.who === userid) {
                        res.who.push(ticket);
                    }
                    if (ticket.requested === userid && ticket.who !== userid) {
                        res.requested.push(ticket);
                    }
                    if (ticket.evaluation === null && ticket.status === 'closed' && ticket.who === userid) {
                        res.evaluate.push(ticket);
                    }
                }

                deferred.resolve({
                    data: res
                });

                return deferred.promise;
            } else {
                return $http({
                    method: 'GET',
                    url: 'http://localhost:3030/tickets/user/' + userid
                });
            }

        }

        function find(id) {
            deferred = $q.defer();
            if (server === false) {
                deferred.resolve({
                    data: tickets[id]
                });
                return deferred.promise;
            } else {
                return $http({
                    method: 'GET',
                    url: 'http://localhost:3030/ticket/id/' + id + '?random=' + Math.random()
                });
            }
        }

        function save(ticket, callback) {
            if (server === false) {
                if (ticket._id === undefined) {
                    ticket.notified = new Date();
                    lastId++;
                    ticket._id = lastId;
                    tickets[lastId] = ticket;
                    if (callback) {
                        callback();
                    }
                }
            } else {
                $http({
                    method: 'POST',
                    url: 'http://localhost:3030/ticket',
                    data: ticket
                }, function success(response) {
                    console.log(response);
                }, function error(response) {
                    console.log(response);
                }).then(function() {
                    if(typeof callback === 'function'){
                        callback();    
                    }
                });
            }
        }

        function make(aFactory, userid) {

            return new myModels.Ticket(aFactory, userid);
        }
    }

})();
