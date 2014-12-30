'use strict';

var genes = require('../');
var chai = require('chai');
var should = chai.should();

describe('genes', function() {

  it('initializes', function() {
    should.exist(genes);
  });

  it('finds square root of 2', function(cb) {
    var Organism = genes.Organism;
    Organism.getRandomGene = function() {
      return Math.random();
    };

    Organism.prototype.fitness = function() {
      return -Math.abs(Math.pow(this.gene, 2) - 2);
    };

    Organism.prototype.mutate = function() {
      this.gene += Math.random() - 0.5;
    };

    Organism.prototype.mate = function(other) {
      return (this.gene + other.gene) / 2;
    };

    var population = new genes.Population(1000);
    population.evolve(function(best, iterations) {
      if (iterations === 100) {
        (Math.abs(best.gene - Math.sqrt(2))).should.be.below(0.001);
        cb();
        return true;
      }
      console.log(iterations + ': ' + best.gene);
      return false;
    });

  });

});
