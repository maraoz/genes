'use strict';

var defaults = require('./defaults');
var Organism = require('./organism');
var _ = require('lodash');
var $ = require('preconditions').singleton();

var Population = function(n, mutationProb) {
  if (_.isUndefined(n)) {
    n = defaults.POPULATION_SIZE;
  }
  if (_.isUndefined(mutationProb)) {
    mutationProb = defaults.MUTATION_PROBABILITY;
  }
  this.n = n;
  this.mutationProb = mutationProb;

  this.initialize();
};

Population.prototype.initialize = function() {
  this.organisms = [];
  for (var i = 0; i < this.n; i++) {
    this.organisms.push(Organism.getRandom());
  }
};

var findMaxFitness = function(best, v) {
  return (best.getFitness() > v.getFitness() ? best : v);
};

var calcTotalFitness = function(sum, v) {
  return sum + v.getFitness();
};

Population.prototype.getBest = function() {
  var best = this.organisms.reduce(findMaxFitness, this.organisms[0]);
  return best;
};

Population.prototype.nextGeneration = function() {
  this.reproduce();
  this.mutate();
};

Population.prototype.reproduce = function() {
  var children = [];
  while (children.length < this.n) {
    var mother = this.chooseMate();
    var father = this.chooseMate();
    var child = mother.mate(father);
    children.push(child);
  }
  this.organisms = children;
};

Population.prototype.mutate = function() {
  for (var i = 0; i < this.n; i++) {
    var organism = this.organisms[i];
    if (Math.random() < this.mutationProb()) {
      organism.mutate();
    }
  }
};

Population.prototype.chooseMate = function() {
  var totalFitness = this.organisms.reduce(calcTotalFitness, 0);
  var r = Math.random() * totalFitness;
  console.log('totalFitness = ' + totalFitness);
  console.log('r = ' + r);
  var sum = 0;
  for (var i = 0; i < this.organisms; i++) {
    var organism = this.organisms[i];
    sum += organism.getFitness();
    if (sum >= r) {
      return organism;
    }
  }
  throw new Error('shouldnt reach here');
};


Population.prototype.evolve = function(generationCallback) {
  $.checkState(_.isFunction(Organism.prototype.fitness), 'Organism must implement fitness method');

  var keepGoing = true;
  var generation = 0;
  while (keepGoing) {
    // get best organism form this generation
    var best = this.getBest();
    // check if termination was reached
    keepGoing = generationCallback(best, generation);

    // create new generation
    generation++;
    this.nextGeneration();
  }
};

module.exports = Population;
