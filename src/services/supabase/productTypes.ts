import { supabase } from '@/integrations/supabase/client'
import { BaseProductType, ProductType, JARAttribute } from '@/types'

// Base Product Type Management
export async function getAllProductTypes(): Promise<BaseProductType[]> {
  try {
    const { data, error } = await supabase
      .from('base_product_types')
      .select('*')
      .order('product_name')

    if (error) throw error

    return (data || []).map((item: any) => ({
      id: item.id,
      productName: item.product_name,
      jarAttributes: [],
      createdAt: item.created_at
    }))
  } catch (error) {
    console.error('Error fetching base product types:', error)
    return []
  }
}

export async function getBaseProductType(productTypeId: string): Promise<BaseProductType | null> {
  try {
    const { data, error } = await supabase
      .from('base_product_types')
      .select('*')
      .eq('id', productTypeId)
      .single()

    if (error || !data) return null

    const { data: sampleProductType } = await supabase
      .from('product_types')
      .select(`
        jar_attributes (*)
      `)
      .eq('base_product_type_id', productTypeId)
      .limit(1)
      .maybeSingle()

    return {
      id: data.id,
      productName: data.product_name,
      jarAttributes: sampleProductType?.jar_attributes ? 
        sampleProductType.jar_attributes.map((attr: any) => ({
          id: attr.id,
          productTypeId: attr.product_type_id,
          nameHR: attr.name_hr,
          nameEN: attr.name_en,
          scaleHR: attr.scale_hr as [string, string, string, string, string],
          scaleEN: attr.scale_en as [string, string, string, string, string]
        })) : [],
      createdAt: data.created_at
    }
  } catch (error) {
    console.error('Error fetching base product type:', error)
    return null
  }
}

export async function createBaseProductType(
  productName: string,
  jarAttributes: JARAttribute[]
): Promise<BaseProductType> {
  const { data: baseType, error: baseError } = await supabase
    .from('base_product_types')
    .insert({
      product_name: productName
    })
    .select()
    .single()

  if (baseError) throw baseError

  return {
    id: baseType.id,
    productName: baseType.product_name,
    jarAttributes: jarAttributes,
    createdAt: baseType.created_at
  }
}

export async function updateBaseProductType(
  productTypeId: string,
  productName: string,
  jarAttributes: JARAttribute[]
): Promise<boolean> {
  try {
    const { error: updateError } = await supabase
      .from('base_product_types')
      .update({ product_name: productName })
      .eq('id', productTypeId)

    if (updateError) throw updateError

    return true
  } catch (error) {
    console.error('Error updating base product type:', error)
    return false
  }
}

export async function deleteProductType(productTypeId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('base_product_types')
      .delete()
      .eq('id', productTypeId)

    return !error
  } catch (error) {
    console.error('Error deleting product type:', error)
    return false
  }
}

// Event Product Type Management
export async function getProductTypes(eventId: string): Promise<ProductType[]> {
  try {
    console.log('=== POČETAK DOHVAĆANJA TIPOVA PROIZVODA ===');
    console.log('Event ID:', eventId);
    
    // Prvo provjeri postoji li event
    const { data: eventCheck, error: eventError } = await supabase
      .from('events')
      .select('id, date')
      .eq('id', eventId)
      .single()
    
    if (eventError) {
      console.error('Event ne postoji ili greška:', eventError);
      return [];
    }
    
    console.log('Event pronađen:', eventCheck);
    
    const { data, error } = await supabase
      .from('product_types')
      .select(`
        *,
        samples (*),
        jar_attributes (*)
      `)
      .eq('event_id', eventId)
      .order('display_order')

    console.log('Supabase query izvršen za event_id:', eventId);
    console.log('Query rezultat - error:', error);
    console.log('Query rezultat - data:', data);
    console.log('Broj pronađenih tipova:', data?.length || 0);

    if (error) {
      console.error('Greška pri dohvaćanju tipova proizvoda:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('Nema tipova proizvoda za ovaj event');
      return [];
    }

    const mappedData = (data || []).map((item: any) => {
      console.log('Mapiranje item:', item.id, item.product_name);
      return {
        id: item.id,
        eventId: item.event_id,
        customerCode: item.customer_code,
        productName: item.product_name,
        baseCode: item.base_code,
        samples: (item.samples || []).map((sample: any) => ({
          id: sample.id,
          productTypeId: sample.product_type_id,
          brand: sample.brand,
          retailerCode: sample.retailer_code,
          blindCode: sample.blind_code,
          images: {
            prepared: sample.images_prepared,
            packaging: sample.images_packaging,
            details: sample.images_details || []
          }
        })),
        jarAttributes: (item.jar_attributes || []).map((attr: any) => ({
          id: attr.id,
          productTypeId: attr.product_type_id,
          nameHR: attr.name_hr,
          nameEN: attr.name_en,
          scaleHR: attr.scale_hr as [string, string, string, string, string],
          scaleEN: attr.scale_en as [string, string, string, string, string]
        })),
        displayOrder: item.display_order,
        baseProductTypeId: item.base_product_type_id,
        hasRandomization: item.has_randomization
      };
    });

    console.log('Mapirani tipovi proizvoda:', mappedData);
    console.log('=== KRAJ DOHVAĆANJA TIPOVA PROIZVODA ===');
    
    return mappedData;
  } catch (error) {
    console.error('=== GREŠKA DOHVAĆANJA TIPOVA PROIZVODA ===');
    console.error('Error details:', error);
    return []
  }
}

export async function createProductType(
  eventId: string,
  customerCode: string,
  baseProductTypeId: string,
  baseCode: string,
  displayOrder: number
): Promise<ProductType> {
  console.log('=== ZAPOČINJE KREIRANJE TIPA PROIZVODA ===');
  console.log('Event ID:', eventId);
  console.log('Base Product Type ID:', baseProductTypeId);
  console.log('Customer Code:', customerCode);
  console.log('Base Code:', baseCode);
  console.log('Display Order:', displayOrder);
  
  try {
    const { data: eventExists, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .single()

    if (eventError || !eventExists) {
      console.error('Event ne postoji:', eventId, eventError);
      throw new Error(`Event s ID ${eventId} ne postoji`)
    }

    console.log('Event postoji, dohvaćam base product type...');

    const baseType = await getBaseProductType(baseProductTypeId)
    if (!baseType) {
      console.error('Base product type ne postoji:', baseProductTypeId);
      throw new Error(`Base product type s ID ${baseProductTypeId} ne postoji`)
    }

    console.log('Base product type pronađen:', baseType.productName);
    console.log('JAR atributi:', baseType.jarAttributes.length);

    console.log('Kreiram product type...');
    const { data: productType, error: productError } = await supabase
      .from('product_types')
      .insert({
        event_id: eventId,
        customer_code: customerCode,
        product_name: baseType.productName,
        base_code: baseCode,
        display_order: displayOrder,
        base_product_type_id: baseProductTypeId,
        has_randomization: false
      })
      .select()
      .single()

    if (productError) {
      console.error('Greška pri kreiranju product type:', productError);
      throw new Error(`Greška pri kreiranju tipa proizvoda: ${productError.message}`)
    }

    console.log('Product type uspješno kreiran s ID:', productType.id);

    if (baseType.jarAttributes.length > 0) {
      console.log('Kopiram JAR atribute...');
      
      const attributesToInsert = baseType.jarAttributes.map(attr => ({
        product_type_id: productType.id,
        name_hr: attr.nameHR,
        name_en: attr.nameEN,
        scale_hr: attr.scaleHR,
        scale_en: attr.scaleEN
      }));

      console.log('Ukupno JAR atributa za kreiranje:', attributesToInsert.length);

      const { data: insertedAttributes, error: attributesError } = await supabase
        .from('jar_attributes')
        .insert(attributesToInsert)
        .select()

      if (attributesError) {
        console.error('Greška pri kreiranju JAR atributa:', attributesError);
        
        console.log('Uklanjam product type zbog neuspjeha JAR atributa...');
        await supabase.from('product_types').delete().eq('id', productType.id);
        
        throw new Error(`Greška pri kreiranju JAR atributa: ${attributesError.message}`)
      }

      console.log('JAR atributi uspješno kreirani:', insertedAttributes?.length || 0);
    } else {
      console.log('Nema JAR atributa za kopiranje');
    }

    console.log('=== KREIRANJE TIPA PROIZVODA ZAVRŠENO USPJEŠNO ===');

    const createdProductType: ProductType = {
      id: productType.id,
      eventId: productType.event_id,
      customerCode: productType.customer_code,
      productName: productType.product_name,
      baseCode: productType.base_code,
      samples: [],
      jarAttributes: baseType.jarAttributes.map(attr => ({
        ...attr,
        productTypeId: productType.id
      })),
      displayOrder: productType.display_order,
      baseProductTypeId: productType.base_product_type_id,
      hasRandomization: productType.has_randomization
    }

    console.log('Vraćam kreirani tip proizvoda:', createdProductType);
    
    // Dodatno: provjeri je li stvarno spremljen u bazu
    console.log('=== PROVJERA SPREMLJENIH PODATAKA ===');
    const verification = await getProductTypes(eventId);
    console.log('Verifikacija - broj tipova nakon kreiranja:', verification.length);
    
    return createdProductType;
  } catch (error) {
    console.error('=== GREŠKA PRI KREIRANJU TIPA PROIZVODA ===');
    console.error('Error details:', error);
    console.error('Error message:', error instanceof Error ? error.message : 'Nepoznata greška');
    throw error;
  }
}

export async function deleteEventProductType(productTypeId: string): Promise<boolean> {
  try {
    console.log('=== BRISANJE TIPA PROIZVODA IZ DOGAĐAJA ===');
    console.log('Product Type ID:', productTypeId);
    
    // Prvo obriši povezane uzorke
    const { error: samplesError } = await supabase
      .from('samples')
      .delete()
      .eq('product_type_id', productTypeId);
    
    if (samplesError) {
      console.error('Greška pri brisanju uzoraka:', samplesError);
      throw samplesError;
    }
    
    console.log('Uzorci uspješno obrisani');
    
    // Obriši JAR atribute
    const { error: jarError } = await supabase
      .from('jar_attributes')
      .delete()
      .eq('product_type_id', productTypeId);
    
    if (jarError) {
      console.error('Greška pri brisanju JAR atributa:', jarError);
      throw jarError;
    }
    
    console.log('JAR atributi uspješno obrisani');
    
    // Obriši randomizaciju ako postoji
    const { error: randomizationError } = await supabase
      .from('randomizations')
      .delete()
      .eq('product_type_id', productTypeId);
    
    if (randomizationError) {
      console.error('Greška pri brisanju randomizacije:', randomizationError);
      throw randomizationError;
    }
    
    console.log('Randomizacija uspješno obrisana');
    
    // Na kraju obriši tip proizvoda
    const { error: productTypeError } = await supabase
      .from('product_types')
      .delete()
      .eq('id', productTypeId);
    
    if (productTypeError) {
      console.error('Greška pri brisanju tipa proizvoda:', productTypeError);
      throw productTypeError;
    }
    
    console.log('Tip proizvoda uspješno obrisan');
    console.log('=== BRISANJE ZAVRŠENO USPJEŠNO ===');
    
    return true;
  } catch (error) {
    console.error('=== GREŠKA PRI BRISANJU TIPA PROIZVODA ===');
    console.error('Error details:', error);
    return false;
  }
}

export async function updateEventProductType(
  productTypeId: string,
  customerCode: string,
  baseCode: string
): Promise<boolean> {
  try {
    console.log('=== AŽURIRANJE TIPA PROIZVODA ===');
    console.log('Product Type ID:', productTypeId);
    console.log('Customer Code:', customerCode);
    console.log('Base Code:', baseCode);
    
    const { error } = await supabase
      .from('product_types')
      .update({
        customer_code: customerCode,
        base_code: baseCode
      })
      .eq('id', productTypeId);
    
    if (error) {
      console.error('Greška pri ažuriranju tipa proizvoda:', error);
      throw error;
    }
    
    console.log('Tip proizvoda uspješno ažuriran');
    return true;
  } catch (error) {
    console.error('=== GREŠKA PRI AŽURIRANJU TIPA PROIZVODA ===');
    console.error('Error details:', error);
    return false;
  }
}
