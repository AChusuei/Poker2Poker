package controllers

import play.api._
import play.api.mvc._

object Application extends Controller {

  def index = Action {
    Ok(views.html.index("Your new application is ready."))
  }

  def game = Action {
    Ok(views.html.game())
  }

  def bootstrap = Action {
    Ok(views.html.bootstrap())
  }

}