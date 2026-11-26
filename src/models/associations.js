import { UserModel } from "./user.model.js";
import { ProfileModel } from "./profile.model.js";
import { ArticleModel } from "./article.model.js";
import { TagModel } from "./tag.model.js";
import { ArticleTagModel } from "./article_tag.model.js";

UserModel.hasOne(ProfileModel, { foreignKey: "user_id", as: "profile", onDelete: "CASCADE" });
ProfileModel.belongsTo(UserModel, { foreignKey: "user_id", as: "user" });

UserModel.hasMany(ArticleModel, { foreignKey: "user_id", as: "articles", onDelete: "CASCADE" });
ArticleModel.belongsTo(UserModel, { foreignKey: "user_id", as: "author" });

ArticleModel.belongsToMany(TagModel, {
  through: ArticleTagModel,
  foreignKey: "article_id",
  otherKey: "tag_id",
  as: "tags",
  onDelete: "CASCADE",
});
TagModel.belongsToMany(ArticleModel, {
  through: ArticleTagModel,
  foreignKey: "tag_id",
  otherKey: "article_id",
  as: "articles",
  onDelete: "CASCADE", 
});

ArticleModel.hasMany(ArticleTagModel, { foreignKey: "article_id", as: "article_tags" });
ArticleTagModel.belongsTo(ArticleModel, { foreignKey: "article_id", as: "article" });
TagModel.hasMany(ArticleTagModel, { foreignKey: "tag_id", as: "article_tags" });
ArticleTagModel.belongsTo(TagModel, { foreignKey: "tag_id", as: "tag" });

export { UserModel, ProfileModel, ArticleModel, TagModel, ArticleTagModel };