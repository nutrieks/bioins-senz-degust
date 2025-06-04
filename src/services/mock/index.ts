
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

productTypes[0].samples = samples.filter(s => s.productTypeId === 'product_test');
productTypes[0].jarAttributes = jarAttributes.filter(ja => ja.productTypeId === 'product_test');

events[0].productTypes = [productTypes[0]];
