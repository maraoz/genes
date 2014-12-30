'use strict';

var genes = require('../');
var chai = require('chai');
var should = chai.should();

describe('genes', function() {

  it('initializes', function() {
    should.exist(genes);
  });

  describe('numeric', function() {
    it('finds square root of 2', function(cb) {
      this.timeout(5000);
      var Organism = genes.Organism;
      Organism.getRandomGene = function() {
        return Math.random() * 10 - 5;
      };

      Organism.prototype.fitness = function() {
        var pow2 = Math.pow(this.genes, 2);
        return -Math.abs(pow2 - 2);
      };

      Organism.prototype.mutate = function() {
        this.genes += Math.random() - 0.5;
      };

      Organism.prototype.mate = function(other) {
        return (this.genes + other.genes) / 2;
      };

      var population = new genes.Population(50);
      population.evolve(function generationCallback(best, generation) {
        if (generation === 5000) {
          console.log(best.genes);
          (Math.abs(Math.abs(best.genes) - Math.sqrt(2))).should.be.below(0.0001);
          cb();
          return true;
        }
        console.log('best for generation ' +
          generation + ': ' + best.genes);
        return false;
      });

    });

    it('finds roots of poly', function(cb) {
      this.timeout(5000);
      var Organism = genes.Organism;
      Organism.getRandomGene = function() {
        return Math.random() * 100 - 50;
      };

      Organism.prototype.evaluate = function() {
        var x = this.genes;
        return x * x + 2 * x - 15;
      };

      Organism.prototype.fitness = function() {
        return -Math.abs(this.evaluate());
      };

      Organism.prototype.mutate = function() {
        this.genes += Math.random() - 0.5;
      };

      Organism.prototype.mate = function(other) {
        return (this.genes + other.genes) / 2;
      };

      var population = new genes.Population(100);
      population.evolve(function generationCallback(best, generation) {
        if (generation === 5000) {
          console.log(best.genes);
          Math.abs(best.evaluate()).should.be.below(0.0001);
          cb();
          return true;
        }
        console.log('best for generation ' +
          generation + ': ' + best.genes);
        return false;
      });

    });
  });

});
