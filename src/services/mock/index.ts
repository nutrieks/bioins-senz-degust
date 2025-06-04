
export * from './users';
export * from './events';
export * from './baseProductTypes';
export * from './productTypes';
export * from './samples';
export * from './jarAttributes';
export * from './evaluations';
export * from './randomizations';
export * from './utils';

// Initialize data relationships
import { productTypes } from './productTypes';
import { samples } from './samples';
import { jarAttributes } from './jarAttributes';
import { events } from './events';

productTypes[0].samples = samples.filter(s => s.productTypeId === 'product1');
productTypes[0].jarAttributes = jarAttributes.filter(ja => ja.productTypeId === 'product1');
productTypes[1].samples = samples.filter(s => s.productTypeId === 'product2');
productTypes[1].jarAttributes = jarAttributes.filter(ja => ja.productTypeId === 'product2');
productTypes[2].samples = samples.filter(s => s.productTypeId === 'product3');
productTypes[2].jarAttributes = jarAttributes.filter(ja => ja.productTypeId === 'product3');

events[1].productTypes = [productTypes[0]];
events[2].productTypes = [productTypes[1]];
events[3].productTypes = [productTypes[2]];
