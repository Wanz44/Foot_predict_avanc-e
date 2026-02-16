
/**
 * OPTIMISATION GÉNÉTIQUE (ASE CORE v5.5)
 * Calibre les poids des indices composites pour une convergence maximale.
 */
export class GeneticAlgorithm {
  private populationSize = 24; 
  private mutationRate = 0.08;
  private crossoverRate = 0.75;
  private elitismCount = 2;
  private generations = 12; 

  async optimize<T extends Record<string, any>>(
    initialParams: T,
    fitnessFunction: (params: T) => Promise<number>
  ): Promise<{ bestParams: T; bestFitness: number; convergence: number[] }> {
    let population = this.initializePopulation(initialParams);
    let bestFitness = -Infinity;
    let bestIndividual = population[0];
    const convergence: number[] = [];

    for (let generation = 0; generation < this.generations; generation++) {
      const fitness = await Promise.all(
        population.map(individual => fitnessFunction(individual))
      );

      const maxFit = Math.max(...fitness);
      const currentBestIndex = fitness.indexOf(maxFit);
      
      if (maxFit > bestFitness) {
        bestFitness = maxFit;
        bestIndividual = JSON.parse(JSON.stringify(population[currentBestIndex]));
      }
      
      convergence.push(maxFit);

      const selected = this.selection(population, fitness);
      const offspring = this.crossover(selected);
      this.mutate(offspring);
      population = this.elitism(population, fitness, offspring);
    }

    return { bestParams: bestIndividual, bestFitness, convergence };
  }

  private initializePopulation<T>(initial: T): T[] {
    return Array.from({ length: this.populationSize }, () => {
      const ind = JSON.parse(JSON.stringify(initial));
      this.mutateIndividual(ind, 0.4); // Forte diversité initiale
      return ind;
    });
  }

  private selection<T>(pop: T[], fit: number[]): T[] {
    return Array.from({ length: pop.length }, () => {
      const i1 = Math.floor(Math.random() * pop.length);
      const i2 = Math.floor(Math.random() * pop.length);
      return fit[i1] > fit[i2] ? JSON.parse(JSON.stringify(pop[i1])) : JSON.parse(JSON.stringify(pop[i2]));
    });
  }

  // Fixed indexing error by casting to any to allow property assignment on generic type T
  private crossover<T extends Record<string, any>>(selected: T[]): T[] {
    const offspring: T[] = [];
    for (let i = 0; i < selected.length; i += 2) {
      if (i + 1 < selected.length && Math.random() < this.crossoverRate) {
        const p1 = selected[i], p2 = selected[i+1];
        // Cast to any to allow write operations on generic type T which extends Record<string, any>
        const c1 = { ...p1 } as any;
        const c2 = { ...p2 } as any;
        Object.keys(p1).forEach(k => { 
          if (Math.random() < 0.5) { 
            c1[k] = p2[k]; 
            c2[k] = p1[k]; 
          } 
        });
        offspring.push(c1 as T, c2 as T);
      } else {
        offspring.push(selected[i]);
        if (i+1 < selected.length) offspring.push(selected[i+1]);
      }
    }
    return offspring;
  }

  private mutate<T>(offspring: T[]) {
    offspring.forEach(ind => this.mutateIndividual(ind, this.mutationRate));
  }

  private mutateIndividual(ind: any, rate: number) {
    Object.keys(ind).forEach(k => {
      if (typeof ind[k] === 'number') {
        if (Math.random() < rate) ind[k] += (Math.random() - 0.5) * ind[k] * 0.25;
      } else if (typeof ind[k] === 'object' && ind[k] !== null) {
        this.mutateIndividual(ind[k], rate);
      }
    });
  }

  private elitism<T>(pop: T[], fit: number[], offspring: T[]): T[] {
    const combined = pop.map((ind, i) => ({ ind, f: fit[i] })).sort((a, b) => b.f - a.f);
    const result = [...offspring];
    for (let i = 0; i < this.elitismCount; i++) result[i] = JSON.parse(JSON.stringify(combined[i].ind));
    return result;
  }
}
