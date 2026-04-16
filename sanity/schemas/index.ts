// Schema index - import all schemas here
import event from './event'
import newsArticle from './newsArticle'
import newsletterIssue from './newsletterIssue'
import presentation from './presentation'
import boardMember from './boardMember'
import kudos from './kudos'
import siteSettings from './siteSettings'
import homePage from './homePage'
import newsPage from './newsPage'
import page from './page'
import storeCategory from './storeCategory'
import storeProduct from './storeProduct'

export const schemaTypes = [
  // Documents
  event,
  newsArticle,
  newsletterIssue,
  presentation,
  boardMember,
  kudos,
  page,
  storeCategory,
  storeProduct,

  // Singletons
  homePage,
  newsPage,
  siteSettings,
]
