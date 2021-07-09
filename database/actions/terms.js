const TermsSchema = require('../models/terms');

// Insert All Terms into DB
const insertTerms = async (terms) => {
  let count = 0;
  try {
    for (const term of terms) {
      await TermsSchema.create(term);
      count++;
    }
    return { error: false, count };
  } catch (error) {
    console.error(error);
    return { error, count };
  }
};

// Get count of all documents in DB
const countTerms = async () => {
  return TermsSchema.estimatedDocumentCount();
};

// Create terms when DB connected
const createTerms = () => {
  countTerms().then((count) => {
    // if terms exist in db return message
    if (count)
      return console.log(
        `Database already has ${count} docs`
      );

    // if db is empty, fetch terms
    initTerms().then(async ({ data }) => {
      const terms = data._embedded.terms;
      // map terms as ui requested
      const termsData = terms.map((term) => ({
        key: term.obo_id,
        label: term.label,
        synonyms: term.synonyms
          ? term.synonyms.join(', ')
          : '-',
        obo_id: term.obo_id,
        term_editor: term.annotation['term editor']
          ? term.annotation['term editor'].join(', ')
          : '-',
        has_children: term.has_children,
      }));

      // insert all mapped terms into the DB
      insertTerms(termsData).then(
        ({ error, count }) => {
          if (error) return console.log(error);
          console.log(
            `${count} terms successfully saved in DB`
          );
        }
      );
    });
  });
};

module.exports = {
  insertTerms,
  countTerms,
  createTerms,
};
