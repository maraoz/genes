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
var findMinFitness = function(best, v) {
  return (best.getFitness() < v.getFitness() ? best : v);
};

var calcTotalFitness = function(sum, v) {
  return sum + v._normFitness;
};

Population.prototype.getBest = function() {
  var best = this.organisms.reduce(findMaxFitness, this.organisms[0]);
  return best.copy();
};

Population.prototype.getWorse = function() {
  var worse = this.organisms.reduce(findMinFitness, this.organisms[0]);
  return worse.copy();
};

Population.prototype.nextGeneration = function() {
  this.reproduce();
  this.mutate();
};

Population.prototype.getChildFor = function(mother, father) {
  var childGenes = mother.mate(father);
  var child = new Organism(childGenes);
  return child;
};

Population.prototype.reproduce = function() {
  var children = [this.getBest()];
  this.normalizeFitness();
  while (children.length < this.n) {
    var mother = this.chooseMate();
    var child;
    if (Math.random() < this.crossoverProb) {
      var father = this.chooseMate();
      child = this.getChildFor(mother, father);
    } else {
      child = mother.copy();
    }
    children.push(child);
  }
  this.organisms = children;
};

Population.prototype.mutate = function() {
  for (var i = 0; i < this.n; i++) {
    var organism = this.organisms[i];
    if (Math.random() < this.mutationProb) {
      organism.mutate();
      organism._fitness = undefined;
    }
  }
};

Population.prototype.normalizeFitness = function() {
  var best = this.getBest();
  var worse = this.getWorse();

  var max = best.getFitness();
  var min = worse.getFitness();
  var delta = max - min;
  for (var i = 0; i < this.organisms.length; i++) {
    var organism = this.organisms[i];
    organism._normFitness = delta*(organism.getFitness() - min);
  }
};

Population.prototype.chooseMate = function() {
  var totalFitness = this.organisms.reduce(calcTotalFitness, 0);
  var r = Math.random() * totalFitness;
  var sum = 0;
  for (var i = 0; i < this.organisms.length; i++) {
    var organism = this.organisms[i];
    sum += organism._normFitness;
    if (sum >= r) {
      return organism;
    }
  }
  throw new Error('shouldnt reach here');
};


Population.prototype.evolve = function(generationCallback) {
  $.checkState(_.isFunction(Organism.prototype.fitness), 'Organism must implement fitness method');

  var stop = false;
  var generation = 0;
  while (!stop) {
    // get best organism form this generation
    var best = this.getBest();
    // check if termination was reached
    stop = generationCallback(best, generation);

    // create new generation
    generation++;
    this.nextGeneration();
  }
};

module.exports = Population;
