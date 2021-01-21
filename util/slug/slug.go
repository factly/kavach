package slug

import (
	"strconv"

	"github.com/factly/kavach-server/model"
)

type comman struct {
	Slug string `gorm:"column:slug" json:"slug"`
}

// Approve return slug
func Approve(slug string) string {
	var result []comman
	model.DB.Model(&model.User{}).Select("slug").Where("slug LIKE ?  AND deleted_at IS NULL", slug).First(&result)
	count := 0
	for {
		flag := true
		for _, each := range result {
			temp := slug
			if count != 0 {
				temp = temp + "-" + strconv.Itoa(count)
			}
			if each.Slug == temp {
				flag = false
				break
			}
		}
		if flag {
			break
		}
		count++
	}
	temp := slug
	if count != 0 {
		temp = temp + "-" + strconv.Itoa(count)
	}
	return temp
}
