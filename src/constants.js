export const TABS = ['Stores', 'Catalogue', 'Users'];
export const FILE_TYPES = ['Stores', 'Catalogue', 'Users'];

const initialAnalysisState = { analysis: null, fileName: null, rowCount: 0, data: null, error: null };

export const initialState = {
  Stores: initialAnalysisState,
  Catalogue: initialAnalysisState,
  Users: initialAnalysisState,
};