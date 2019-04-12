/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
/* eslint max-classes-per-file: 0 */ // --> OFF

type NonNeverPropertyNames<T> = { [K in keyof T]: T[K] extends never ? never : K }[keyof T];
type ObjectWithoutNever<T> = Pick<T, NonNeverPropertyNames<T>>;

interface RequiredIngredients {
  milk: string;
  butter: string;
  jam: boolean;
}
interface IngredientsAtHome {
  milk: string;
  butter: boolean;
  jelly: string;
}

type IngredientsMissingFromHome<RI, IH extends { [key: string]: unknown }> = ObjectWithoutNever<{
  [key in keyof RI]: IH[key] extends RI[key] ? never : RI[key]
}>;

type Test2<O, T extends { [key: string]: unknown }> = Pick<O, { [ K in keyof O ]: O[K] extends T[K] ? never : K }[keyof O]>

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

// ObjectWithoutNever<
//  { [key in keyof RI]: IH[key] extends RI[key] ? never : RI[key] }
// >;

type test6 = Omit<RequiredIngredients, keyof IngredientsAtHome>; // type test6 = { butter: "string"; jam: "boolean"; }

function collectIngredients<RI, IH>(
  ingredientsAtHome: IH,
  ingredientsAtStore: IngredientsMissingFromHome<RI,  IH>
): RI {
  return {
    ...ingredientsAtHome,
    ...ingredientsAtStore,
  }; // as RI; // as RI; // Bad! have to cast as unknown then to RI :(
  // return ri;
}

// const test2 = collectIngredients<RequiredIngredients, IngredientsAtHome>({ milk: 'hi' }, {}); // Should pass
type tt = IngredientsMissingFromHome<{ milk: string }, { milk: string }>;

const requiredIngredients0 = collectIngredients<{ milk: string }, { milk: string }>(
  { milk: 'hi' },
  {}
); // Should pass

const requiredIngredients5 = collectIngredients<{ milk: string }, { milk: string }>(
  { milk: 'hi' },
  { cookies: 'hi' }
); // Should pass
const requiredIngredients1 = collectIngredients<{ milk: string }, { milk: string }>(
  { milk: 'hi' },
  { milk: 'two' }
); // Should pass
const requiredIngredients2 = collectIngredients<{ milk: string }, { milk: boolean }>(
  { milk: true },
  { milk: 'hi' }
); // passes
const requiredIngredients3 = collectIngredients<{ milk: string }, { milk: boolean }>(
  { milk: true },
  {}
); // Should fail
const requiredIngredients34 = collectIngredients<{ milk: string }, { milk: boolean }>(
  { milk: true },
  { milk: false }
); // Should fail
const requiredIngredients4 = collectIngredients<{ milk: string }, { butter: boolean }>(
  { butter: true },
  { cookies: false }
); // Should fail

////////////////////////

class Recipe<RI = {}> {
  constructor(public type: string, public ingredients: RI) {}
}

class Factories {
  public recipeFactories: { [key: string]: <RII>(ing: RII) => Recipe<RII> } = {};
  constructor() {}

  addFactory<RI>(type: string, recipeFactory: (ing: RI) => Recipe<RI>) {
    this.recipeFactories[type] = recipeFactory;
  }
}

interface RequiredSoupIngredients {
  broth: string;
}

class SoupRecipe extends Recipe<RequiredSoupIngredients> {
  constructor(ingredients: RequiredSoupIngredients) {
    super('soup', ingredients);
  }
}
const factories = new Factories();

factories.addFactory<RequiredSoupIngredients>(
  'soup',
  (ing: RequiredSoupIngredients) => new SoupRecipe(ing)
);

function createRecipe<RI>(type: string): Recipe<RI> {
  return recipeFactories[type]();
}

class Home<IH> {
  private recipes: Recipe[] = [];
  private extraStorage: { [key: string]: unknown } = {};

  constructor(private home_ingredients: IH) {}

  public bakeRecipe<RI>(ingredientsFromStore: IngredientsMissingFromHome<RI, IH>) {
    const ingredients = collectIngredients<RI, IH>(this.home_ingredients, ingredientsFromStore);
    return new Recipe<RI>('test', ingredients);
  }

  public addNewRecipe<RI>(type: string, extraIngredients: IngredientsMissingFromHome<RI, IH>) {
    const recipe = createRecipe(type);
    this.recipes.push(recipe);
  }

  public getRecipe<RI>(type: string) {
    return this.recipes.find(recipe => recipe.type === type) as Recipe<RI>;
  }
}

const home = new Home<{ milk: string; broth: 'hi' }>({ milk: 'hi', broth: 'hi' });
home.addNewRecipe<RequiredSoupIngredients>('soup', {});

const soup = home.getRecipe<RequiredSoupIngredients>('soup');

home.makeRecipe('soup');


class GreetingEmbeddable extends Embeddable<{ name: string, birthMonth: number, birthDay: number, currentMonth: number, currentDay: number }> {

  render() {
    if (this.input.birthMonth === this.input.currentMonth && this.input.birthDay === this.input.currentDay) {
      return <div>Happy birthday {this.input.name}</div>
    } else {
      return <div>Hello, {this.input.name}</div>
    }
  }
}

const calendarContainer = new CalendarContainer('1/1/2015');
calendarContainer.addNewEmbeddable(GREETING_EMBEDDABLE_TYPE, { name: 'Stacey', birthday: '1/1/1995' });


calendarContainer.addNewEmbeddable(GREETING_EMBEDDABLE_TYPE, { name: 'Stacey', birthday: '1/1/1995', currentMonth: 12 });

