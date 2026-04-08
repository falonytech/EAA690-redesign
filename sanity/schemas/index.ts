// Schema index - import all schemas here
import event from './event'
import newsArticle from './newsArticle'
import presentation from './presentation'
import boardMember from './boardMember'
import kudos from './kudos'
import siteSettings from './siteSettings'
import page from './page'
import storeCategory from './storeCategory'
import storeProduct from './storeProduct'

export const schemaTypes = [
  // Documents
  event,
  newsArticle,
  presentation,
  boardMember,
  kudos,
  page,
  storeCategory,
  storeProduct,

  // Singletons
  siteSettings,
]
