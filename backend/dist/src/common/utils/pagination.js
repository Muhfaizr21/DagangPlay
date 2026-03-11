"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = void 0;
const paginate = async (model, args = { where: {} }, options = { page: 1, perPage: 10 }) => {
    const page = Number(options.page || 1);
    const perPage = Number(options.perPage || 10);
    const skip = page > 0 ? perPage * (page - 1) : 0;
    const [total, data] = await Promise.all([
        model.count({ where: args.where }),
        model.findMany({
            ...args,
            take: perPage,
            skip,
        }),
    ]);
    const lastPage = Math.ceil(total / perPage);
    return {
        data,
        meta: {
            total,
            lastPage,
            currentPage: page,
            perPage,
            prev: page > 1 ? page - 1 : null,
            next: page < lastPage ? page + 1 : null,
        },
    };
};
exports.paginate = paginate;
//# sourceMappingURL=pagination.js.map