'use strict';

var _ = require('lodash');
var $ = require('preconditions').singleton();

var Organism = function(genes) {
  $.checkArgument(!_.isUndefined(genes));
  this.genes = genes;
};

Organism.prototype.copy = function() {
  return new Organism(JSON.parse(JSON.stringify(this.genes)));
};

Organism.getRandom = function() {
  $.checkState(_.isFunction(Organism.getRandomGene), 'Organism must implement getRandomGene class function');
  var random = new Organism(Organism.getRandomGene());
  return random;
};

Organism.prototype.getFitness = function() {
  if (!_.isUndefined(this._fitness)) {
    return this._fitness;
  }
  $.checkState(_.isFunction(Organism.prototype.fitness), 'Organism must implement fitness method');
  this._fitness = this.fitness();
  return this._fitness;
};

module.exports = Organism;
