const validateFile = (fileType, data) => {
  const errors = [];
  let catalogueType = "N/A";

  switch (fileType) {
    case 'Stores':
      validateStores(data, errors);
      break;
    case 'Catalogue':
      catalogueType = validateCatalogue(data, errors);
      break;
    case 'Users':
      validateUsers(data, errors);
      break;
    default:
      errors.push({ row: null, column: null, message: `Unknown file type: ${fileType}` });
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    catalogueType: catalogueType,
  };
};

const validateStores = (data, errors) => {
  if (!data || data.length === 0) {
    errors.push({ row: null, column: null, message: "File cannot be empty." });
    return;
  }
  const requiredFields = ['reference', 'name', 'city', 'full_address', 'postal_code', 'store_phone', 'store_manager_fullname'];

  data.forEach((row, index) => {
    requiredFields.forEach(field => {
      if (!row[field]) {
        errors.push({ row: index + 2, column: field, message: `Required data in "${field}".` });
      }
    });

    if (row['reference'] && !/^[a-zA-Z0-9]+$/.test(row['reference'])) {
      errors.push({ row: index + 2, column: 'reference', message: '"reference" should only contain letters and numbers.' });
    }
  });
};

const validateCatalogue = (data, errors) => {
  if (!data || data.length === 0) {
    errors.push({ row: null, column: null, message: "The catalogue file is empty." });
    return "Unknown";
  }

  let catalogueType = "Unknown";
  const headers = Object.keys(data[0]);

  if (headers.includes('price_with_tax')) {
    catalogueType = "eduQa";
    const requiredFields = ['reference', 'name', 'price_with_tax'];
    data.forEach((row, index) => {
      requiredFields.forEach(field => {
        if (row[field] === undefined || row[field] === null || row[field] === '') {
          errors.push({ row: index + 2, column: field, message: `Required data in "${field}".` });
        }
      });

      const priceWithTax = row['price_with_tax'];
      if (priceWithTax && !/^\d+$/.test(priceWithTax)) {
        errors.push({ row: index + 2, column: 'price_with_tax', message: '"price_with_tax" must be an integer in cents (no dots or commas).' });
      }

      const downloadable = row['downloadable'];
      if (downloadable !== undefined && downloadable !== null && downloadable !== '') {
        if (downloadable.toLowerCase() !== 'true' && downloadable.toLowerCase() !== 'false') {
          errors.push({ row: index + 2, column: 'downloadable', message: '"downloadable" must be "true" or "false".' });
        }
      }

      const endsIn = row['ends_in'];
      if (endsIn && !/^P(?!$)(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?$/.test(endsIn)) {
        errors.push({ row: index + 2, column: 'ends_in', message: '"ends_in" must respect the ISO 8601 Duration format (e.g., P9M).' });
      }
    });
  } else if (headers.includes('Price')) {
    catalogueType = "Retail";
    const requiredFields = ['Reference', 'Name', 'Price'];
    data.forEach((row, index) => {
      requiredFields.forEach(field => {
        if (row[field] === undefined || row[field] === null || row[field] === '') {
          errors.push({ row: index + 2, column: field, message: `Required data in "${field}".` });
        }
      });

      const price = row['Price'];
      if (price && !/^\d+$/.test(price)) {
        errors.push({ row: index + 2, column: 'Price', message: '"Price" must be an integer in cents (no dots or commas).' });
      }

      const category = row['Category'];
      if (category !== undefined && category !== null && category !== '') {
        if (category.includes(',') || category.includes(';')) {
          errors.push({ row: index + 2, column: 'Category', message: '"Category" can only contain one category (no commas or semicolons).' });
        }
      }

      const image = row['Image'];
      if (image && !/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(image)) {
        errors.push({ row: index + 2, column: 'Image', message: '"Image" must be a valid URL.' });
      }
    });
  } else {
    errors.push({ row: null, column: null, message: "The catalogue file format is not recognized (neither Retail nor eduQa). The 'Price' or 'price_with_tax' columns were not found." });
  }
  return catalogueType;
};

const validateUsers = (data, errors) => {
  if (!data || data.length === 0) {
    errors.push({ row: null, column: null, message: "File cannot be empty." });
    return;
  }

  const requiredFields = ['Name', 'Username', 'Password'];
  let hasAdmin = false;
  const emptyRows = [];

  data.forEach((row, index) => {
    const isRowEmpty = Object.values(row).every(val => val === '' || val === null || val === undefined);

    if (isRowEmpty) {
      emptyRows.push(index + 2);
      errors.push({ row: index + 2, column: null, message: `Row ${index + 2} is empty.` });
      return;
    }

    requiredFields.forEach(field => {
      if (!row[field]) {
        errors.push({ row: index + 2, column: field, message: `Required field "${field}" is missing.` });
      }
    });

    if (row['Username'] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row['Username'])) {
      errors.push({ row: index + 2, column: 'Username', message: '"Username" is not a valid email format.' });
    }

    if (row['Password'] && row['Password'].length < 8) {
      errors.push({ row: index + 2, column: 'Password', message: '"Password" must be at least 8 characters long.' });
    }

    if (row['Role'] && row['Role'] !== 'Admin') {
      errors.push({ row: index + 2, column: 'Role', message: 'The "Role" field can only be "Admin" or empty.' });
    } else if (row['Role'] === 'Admin') {
      hasAdmin = true;
    }
  });

  if (data.length > emptyRows.length && !hasAdmin) {
    errors.push({ row: null, column: null, message: "The file must contain at least one user with the 'Admin' role." });
  }

  // Check for duplicate usernames
  const usernameMap = new Map();
  data.forEach((row, index) => {
    const username = row['Username'];
    if (username) {
        const lowerCaseUsername = username.toLowerCase();
        if (!usernameMap.has(lowerCaseUsername)) {
            usernameMap.set(lowerCaseUsername, []);
        }
        usernameMap.get(lowerCaseUsername).push(index + 2);
    }
  });

  usernameMap.forEach((rows, username) => {
      if (rows.length > 1) {
          rows.forEach(rowNum => {
              errors.push({
                  row: rowNum,
                  column: 'Username',
                  message: `The username "${username}" is duplicated in rows: ${rows.join(', ')}.`
              });
          });
      }
  });
};

export default validateFile;