import { createPaginator, extension, paginate } from './extension'

export {
  CursorPaginationMeta,
  CursorPaginationOptions,
  PageNumberPaginationMeta,
  PageNumberPaginationOptions,
} from './types'

export default extension

export { createPaginator, paginate, extension as pagination }
