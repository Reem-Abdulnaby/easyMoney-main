class ApiFeatures {
  constructor(query) {
    this.query = query;
  }
  static async pagination(query, reqQuery) {
    const currentPage = +reqQuery.page || 1;
    const limit = +reqQuery.limit || 10
    const skip = limit * (currentPage - 1);
    const newQuery = await query.limit(limit).skip(skip)
    return newQuery;
  }
}
module.exports = ApiFeatures;