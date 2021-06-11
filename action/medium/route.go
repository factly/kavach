package medium

import (
	"encoding/json"
	"net/url"

	"github.com/factly/kavach-server/model"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
	"github.com/spf13/viper"
)

// medium model
type medium struct {
	Name        string         `json:"name" validate:"required"`
	Slug        string         `json:"slug"`
	Type        string         `json:"type" validate:"required"`
	Title       string         `json:"title"`
	Description string         `json:"description"`
	Caption     string         `json:"caption"`
	AltText     string         `json:"alt_text"`
	FileSize    int64          `json:"file_size" validate:"required"`
	URL         postgres.Jsonb `json:"url" swaggertype:"primitive,string"`
	Dimensions  string         `json:"dimensions" validate:"required"`
}

var userContext model.ContextKey = "medium_user"

// Router - Group of medium router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Post("/", create)

	r.Route("/{medium_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Put("/", update)
		r.Delete("/", delete)
	})

	return r

}

func addProxyURL(medium *model.Medium) {
	resurl := map[string]interface{}{}
	if viper.IsSet("imageproxy_url") && medium.URL.RawMessage != nil {
		_ = json.Unmarshal(medium.URL.RawMessage, &resurl)
		if rawURL, found := resurl["raw"]; found {
			urlObj, _ := url.Parse(rawURL.(string))
			resurl["proxy"] = viper.GetString("imageproxy_url") + urlObj.Path

			rawBArr, _ := json.Marshal(resurl)
			medium.URL = postgres.Jsonb{
				RawMessage: rawBArr,
			}
		}
	}
}
