class APIFeatures {
  constructor(queryObj, queryParams) {
    this.queryObj = queryObj;
    this.queryParams = queryParams;
  }
  filter() {
    // Filtering reserved keys
    let queryParamsClone = { ...this.queryParams };
    const excludedKeys = ['page', 'sort', 'limit', 'fields'];
    excludedKeys.forEach((key) => delete queryParamsClone[key]);

    // Advanced Filtering
    const queryStr = JSON.stringify(queryParamsClone).replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    queryParamsClone = JSON.parse(queryStr); // converting back to JS Obj
    this.queryObj = this.queryObj.find(queryParamsClone);
    return this; // returning the instance
  }
  sort() {
    // Sorting
    if (this.queryParams.sort) {
      const sortBy = this.queryParams.sort.split(',').join(' ');
      this.queryObj = this.queryObj.sort(sortBy);
    } else {
      this.queryObj = this.queryObj.sort('-createdAt');
    }
    return this;
  }
  // Selecting specific fields
  project() {
    // Projecting (Selecting only specific fields)
    if (this.queryParams.fields) {
      const fields = this.queryParams.fields.split(',').join(' ');
      this.queryObj = this.queryObj.select(fields);
    } else {
      this.queryObj = this.queryObj.select('-__v');
    }
    return this;
  }
  paginate() {
    // Pagination
    const page = +this.queryParams.page || 1;
    const limit = +this.queryParams.limit || 100;
    const skip = (page - 1) * limit;
    this.queryObj = this.queryObj.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
