$(function(){ // on dom ready

var cy = cytoscape({
  container: document.getElementById('cy'),
  userZoomingEnabled: false,
  userPanningEnabled: false,

  style: cytoscape.stylesheet()
    .selector('node')
      .css({
        'content': 'data(id)'
      })
    .selector('edge')
      .css({
        'content': 'data(weight)',
        'width': 4,
        'line-color': '#ddd',
      })
    .selector('.highlighted')
      .css({
        'background-color': '#06AED5',
        'line-color': '#06AED5',
        'transition-property': 'background-color, line-color',
        'transition-duration': '0.5s'
      })
    .selector('.error')
      .css({
        'background-color': '#DD1C1A',
        'line-color': '#DD1C1A',
        'transition-property': 'background-color, line-color',
        'transition-duration': '0.5s'
      }),

  elements: {
      nodes: [
        { data: { id: 'a' } },
        { data: { id: 'b' } },
        { data: { id: 'c' } },
        { data: { id: 'd' } },
        { data: { id: 'e' } }
      ],

      edges: [
        { data: { id: 'ae', weight: 1, source: 'a', target: 'e' } },
        { data: { id: 'ab', weight: 3, source: 'a', target: 'b' } },
        { data: { id: 'be', weight: 4, source: 'b', target: 'e' } },
        { data: { id: 'bc', weight: 5, source: 'b', target: 'c' } },
        { data: { id: 'ce', weight: 6, source: 'c', target: 'e' } },
        { data: { id: 'cd', weight: 2, source: 'c', target: 'd' } },
        { data: { id: 'de', weight: 7, source: 'd', target: 'e' } }
      ]
    },

  layout: {
    name: 'breadthfirst',
    roots: '#a',
    padding: 10
  }
});

var animationLength = 100;

function errorMsg(msg) {
  var success = $("#successMsg");
  var error = $("#errorMsg");

  if (error.is(":visible")) {
    error.hide(animationLength);
  }

  if (success.is(":visible")) {
    success.hide(animationLength);
  }

  error.html(msg);
  error.show(animationLength);
}

function successMsg(msg) {
  var success = $("#successMsg");
  var error = $("#errorMsg");

  if (error.is(":visible")) {
    error.hide(animationLength);
  }

  if (success.is(":visible")) {
    success.hide(animationLength);
  }

  success.html(msg);
  success.show(animationLength);
}

$("#error").hide();
$("#success").hide();
var bfs = cy.elements().bfs('#a', function(){}, true);

var connectedNodes = cy.collection('#a');
var choosenEdges = cy.collection();

connectedNodes.addClass('highlighted');

cy.on('tap', 'edge', function (evt) {
  var edge = evt.cyTarget;
  var edgeNodes = edge.connectedNodes();

  cy.edges('.error').removeClass('error');

  if (choosenEdges.anySame(edge)) {
    edge.addClass('error');
    errorMsg('This edge is already choosen!');
    return;
  }

  if (edgeNodes.difference(connectedNodes).empty()) {
    edge.addClass('error');
    errorMsg('This would yield a circle!');
    return;
  }

  if (!edgeNodes.anySame(connectedNodes)) {
    edge.addClass('error');
    errorMsg('This edge is not connected to the selected subgraph!');
    return;
  }

  var unchoosenEdges = cy.edges().difference(choosenEdges);
  var uncyclicEdges = unchoosenEdges.filter(function (i, edge) {
    return !edge.connectedNodes().difference(connectedNodes).empty() && edge.connectedNodes().anySame(connectedNodes);
  });

  var best = uncyclicEdges.min(function (edge) {
    return edge.data('weight');
  });
  var bestWeight = best.value;
  var possibleEdges = uncyclicEdges.filter('edge[weight =' + bestWeight + ']');

  if (!possibleEdges.anySame(edge)) {
    edge.addClass('error');
    errorMsg('Sure?! There is a better one.');
    return;
  }

  choosenEdges = choosenEdges.add(edge);
  connectedNodes = choosenEdges.connectedNodes();
  edge.addClass('highlighted');
  edgeNodes.addClass('highlighted');

  if (connectedNodes.same(cy.nodes())) {
    successMsg("Awesome! You've found a minimum spanning tree!");
    cy.unbind('tap', 'edge');
  } else {
    successMsg('Great choice!');
  }

});


}); // on dom ready
