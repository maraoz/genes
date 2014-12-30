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
          (Math.abs(Math.abs(best.genes) - Math.sqrt(2))).should.be.below(0.0001);
          cb();
          return true;
        }
        console.log('best for generation ' +
          generation + ': ' + best.genes);
        return false;
      });

    });
    it('finds point in circle', function(cb) {
      this.timeout(5000);
      var Organism = genes.Organism;
      Organism.getRandomGene = function() {
        return {
          x: Math.random() * 2,
          y: Math.random() * 2
        };
      };

      Organism.prototype.fitness = function() {
        var p = this.genes;
        return -Math.abs(p.x * p.x + p.y + p.y - 1);
      };

      Organism.prototype.mutate = function() {
        this.genes.x += Math.random() - 0.5;
        this.genes.y += Math.random() - 0.5;
      };

      Organism.prototype.mate = function(other) {
        return {
          x: (this.genes.x + other.genes.x) / 2,
          y: (this.genes.y + other.genes.y) / 2
        };
      };

      var population = new genes.Population(100);
      population.evolve(function generationCallback(best, generation) {
        if (generation === 5000) {
          var p = best.genes;
          var dtc = Math.abs(p.x * p.x + p.y + p.y - 1);
          dtc.should.be.below(0.0001);
          cb();
          return true;
        }
        console.log('best for generation ' +
          generation + ': ' + JSON.stringify(best.genes));
        return false;
      });

    });

  });
  describe('other', function() {
    it('finds roots of poly', function(cb) {
      this.timeout(5000);
      var Organism = genes.Organism;
      var rs = function() {
        return Math.random().toString(16).substring(2);
      };
      Organism.getRandomGene = function() {
        return rs() + rs() + rs();
      };

      Organism.prototype.evaluate = function() {
        var w = this.genes;
        var count = 0;
        for (var i = 0; i < w.length; i++) {
          if (w[i] === 'c') {
            count += 1;
          }
        }
        return count;
      };

      Organism.prototype.fitness = function() {
        return this.evaluate();
      };

      Organism.prototype.mutate = function() {
        var w = this.genes;
        this.genes = '';
        for (var i = 0; i < w.length; i++) {
          this.genes += Math.random() < 0.25 ? (Math.random().toString(16).substring(9) || 'a') : w[i];
        }
      };

      Organism.prototype.mate = function(other) {
        var ret = '';
        for (var i = 0; i < this.genes.length; i++) {
          ret += Math.random() < 0.5 ? this.genes[i] : other.genes[i];
        }
        return ret;
      };

      var population = new genes.Population(50);
      population.evolve(function generationCallback(best, generation) {
        if (generation === 5000) {
          best.evaluate().should.be.above(20);
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
