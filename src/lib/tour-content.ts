type TourContentOverride = {
  address?: string;
  cultureStory?: string;
  tastingTip?: string;
};

export const TOUR_CONTENT_OVERRIDES: Record<string, Partial<Record<number, TourContentOverride>>> = {
  "hanoi": {
    "0": {
      "cultureStory": "Phở ra đời ở miền Bắc đầu thế kỷ 20, được cho là chịu ảnh hưởng của món bò hầm Pháp (pot-au-feu) và cách nấu nước dùng của người Việt. Ban đầu phở được gánh rong bán khắp phố phường Hà Nội, sau mới có quán cố định. Linh hồn của phở là nước dùng hầm xương bò nhiều giờ, trong và ngọt thanh. Với người Hà Nội, phở là bữa sáng quen thuộc và cũng là biểu tượng ẩm thực của cả nước.",
      "tastingTip": "Nếm nước dùng trước khi cho gia vị. Sau đó thêm chút hành, tiêu, vài lát ớt hoặc tương ớt, và chút giấm tỏi nếu thích. Người Hà Nội thường không cho nhiều rau thơm.",
      "address": "Phở Thìn Bờ Hồ (61 Đinh Tiên Hoàng), Phở Gia Truyền (49 Bát Đàn)"
    },
    "1": {
      "cultureStory": "Bún chả là món của bữa trưa Hà Nội, thường bán vào buổi trưa và gắn với khói than hoa thơm lừng ở các góc phố. Chả gồm thịt ba chỉ và chả viên băm, ướp rồi nướng trên than. Món này nổi tiếng thế giới sau bữa ăn của Tổng thống Mỹ Obama năm 2016 tại Hương Liên. Từ đó quán này còn được gọi là “bún chả Obama”.",
      "tastingTip": "Cho chả nướng vào bát nước chấm chua ngọt có đu đủ xanh và cà rốt. Gắp bún, rau sống và nem cua bể, chấm nước chấm rồi ăn cùng, thêm tỏi ớt tùy khẩu vị.",
      "address": "Bún chả Hương Liên (24 Lê Văn Hưu), Bún chả Đắc Kim (1 Hàng Mành)"
    },
    "2": {
      "cultureStory": "Bánh giò là món quà sáng bình dân của người Hà Nội, gói bằng lá chuối rồi hấp nóng. Bột gạo tẻ mềm mịn bọc nhân thịt băm, mộc nhĩ và hành khô. Hình ảnh gánh bánh giò trong sương sớm gắn với ký ức nhiều thế hệ. Bánh thường được ăn nóng, vừa bóc vừa thổi. Nem chua rán Hà Nội thật ra không có vị chua như nem chua truyền thống. Đây là loại nem ngọt, tẩm bột rồi chiên giòn, chấm tương ớt. Món này là món ăn vặt quen thuộc của học sinh, sinh viên Hà Nội qua nhiều thế hệ. Quán thường nhỏ và đông, ăn cùng bạn bè là nhất.",
      "tastingTip": "Bóc lá, rắc chút tiêu và ăn nóng; có thể chấm nước mắm hoặc tương ớt, ăn kèm dưa góp hoặc chả. Nem chua rán nên ăn nóng ngay sau khi chiên, chấm tương ớt và ăn kèm dưa chuột hoặc rau sống.",
      "address": "Bánh giò Cô Béo, 3 Thụy Khuê, Tây Hồ; nem chua rán ở ngõ Tạm Thương, 36 Tạm Thương, Hoàn Kiếm, 10 Ấu Triệu hoặc Gốc Đa, 52 Lý Quốc Sư."
    },
    "3": {
      "cultureStory": "Món chả cá bắt nguồn từ một gia đình họ Đoàn ở phố Hàng Sọt. Quán nổi tiếng đến mức phố này sau đó được đổi tên thành phố Chả Cá. Cá lăng được ướp nghệ, riềng, mẻ rồi nướng, sau đó mang lên bàn và chiên lại với thì là, hành lá ngay trên bếp than nhỏ. Đây là món ăn quen thuộc trong ẩm thực Hà Nội và được xem là một đặc sản của phố cổ.",
      "tastingTip": "Cho bún, lạc rang, rau thơm vào bát, gắp cá nóng vừa chiên và thêm mắm tôm pha chanh, ớt. Đây là cách ăn đúng kiểu chả cá Hà Nội.",
      "address": "Chả cá Lã Vọng (14 phố Chả Cá), Chả cá Thăng Long (6B Đường Thành)"
    }
  },
  "haiphong": {
    "0": {
      "cultureStory": "Bún cá cay được xem là món đặc sản tiêu biểu nhất của Hải Phòng. Một bát chuẩn có đủ màu sắc: vàng của cá rán và chả cá, đỏ của tương ớt, xanh của dọc mùng, trắng của sợi bún. Món này quen thuộc với bữa sáng của người dân đất Cảng, thường kèm cả dồi và cá viên. Vị cay đậm là nét rất riêng, khác với bún cá nhẹ vị ở nhiều nơi khác.",
      "tastingTip": "Ăn nóng, thêm rau sống để vị tròn hơn. Chanh, ớt và mắm tôm tùy khẩu vị. Nếu ăn được cay, hãy thử thêm chút tương ớt để đúng vị Hải Phòng.",
      "address": "47 Lạch Tray, Ngô Quyền (Thắng Tồ)"
    },
    "1": {
      "cultureStory": "Bánh đa cua được coi là món làm nên tên tuổi cho ẩm thực đất cảng, giống như phở với Hà Nội. Để ngon, món này cần bánh đa đỏ của làng Dư Hàng Kênh, vốn dẻo dai và ngâm nước lâu cũng không nát. Nước dùng nấu từ riêu cua, ăn kèm rau muống chẻ và chả. Người Hải Phòng ăn món này ở nhiều bữa trong ngày.",
      "tastingTip": "Ăn nóng để bánh còn dai. Trộn đều rau muống và giá, thêm hành phi. Có thể thêm chút mắm tôm hoặc ớt tùy vị.",
      "address": "195 Cầu Đất, Ngô Quyền (Bà Cụ)"
    },
    "2": {
      "cultureStory": "Nem cua bể khác nem rán thông thường ở chỗ được gói to, vuông vắn bằng lòng bàn tay. Hình vuông này được cho là tượng trưng cho đất trong quan niệm dân gian. Nhân gồm thịt cua bể, tôm và nấm hương, trong đó thịt cua là thành phần chính. Cua gạch được chọn kỹ và chỉ làm thịt trước khi nấu khoảng 10–15 phút để thịt cua trắng và ngon. Món này thường xuất hiện trong bữa cơm hằng ngày lẫn các dịp lễ Tết. Dừa dầm là món ăn vặt mát lạnh gắn với Hải Phòng, nhất là vào mùa hè nắng gắt. Món này gồm dừa nạo, thạch rau câu, sữa đặc và đá, và công đoạn làm thạch rau câu rất quan trọng để dừa dầm ngon đúng vị. Nhiều quán còn thêm trân châu, dừa khô hoặc dừa nạo sợi. Dừa dầm thường được bán cùng cà phê cốt dừa, một đặc sản đồ uống khác của thành phố.",
      "tastingTip": "Ăn nóng ngay sau khi rán, cuốn với bún, xà lách và các loại rau thơm, chấm nước chấm chua ngọt. Trộn đều rồi ăn bằng thìa khi còn lạnh. Nên ăn sau bữa chính hoặc vào buổi chiều nóng để thấy rõ vị mát.",
      "address": "Nem cua bể: 92 Trần Nhật Duật, Cầu Đất; dừa dầm: 100/124 Lạch Tray, 124 Lạch Tray, 9/126 Đằng Giang hoặc 130 Lam Sơn, Lê Chân."
    },
    "3": {
      "cultureStory": "Lẩu cua đồng là món của những bữa ăn quây quần, nhất là trời se lạnh. Nước dùng ngọt thanh từ cua đồng, thường có độ sệt của gạch cua và cà chua. Ở Hải Phòng, món này thường ăn kèm bánh đa đỏ và chả cá biển. Một số quán còn thêm topping như trứng vịt lộn, chả viên, thịt bò và riêu cua.",
      "tastingTip": "Nhúng rau muống, đậu phụ và bánh đa đỏ vào khi nước đang sôi. Thêm chút mắm tôm hoặc ớt tùy khẩu vị, ăn nóng để giữ vị ngọt của cua.",
      "address": "7 Phạm Bá Trực, Hồng Bàng (quán Hương) 188 Văn Cao, Ngô Quyền (Minh Quỳnh) 278b Lạch Tray, Ngô Quyền (Bống) 29–31 Hoàng Minh Thảo (Uyên Ương) 151 Vũ Trọng Khánh (Sen Việt)"
    }
  },
  "hanam": {
    "0": {
      "cultureStory": "Phủ Lý là thành phố ngã ba sông, nơi sông Đáy, sông Nhuệ và sông Châu Giang hợp lại. Bánh cuốn ở đây được tráng hai lớp mỏng từ gạo tám xoan, và bánh nguội nhưng phải chấm cùng nước chấm nóng đủ vị chua, cay, mặn, ngọt. Nhiều người ví bánh cuốn Phủ Lý như sự kết hợp giữa bánh cuốn Thanh Trì và bún chả Hà Nội. Hành tím được phi bằng mỡ lợn thay vì hành phi công nghiệp.",
      "tastingTip": "Gắp bánh cuốn, chả nướng và rau ghém vào bát, chan thật nhiều nước chấm nóng. Ăn kèm rau sống, thêm hành phi và chút ớt tùy khẩu vị. Một suất thường có giá khoảng 30.000–50.000 đồng.",
      "address": "217C Trường Chinh, Hai Bà Trưng (Hùng Nụ)"
    },
    "1": {
      "cultureStory": "Làng Vũ Đại gắn với tác phẩm \"Chí Phèo\" của Nam Cao, nên dân làng còn gọi đùa món này là cá kho \"Bá Kiến\". Món này trước đây được dâng tiến vua. Cá trắm đen từ 4 kg trở lên được kho trong niêu đất bằng củi nhãn, và vụ kho cá bắt đầu từ 20 tháng chạp, sôi động nhất dịp Tết. Theo một bài báo, mỗi niêu cá giá trung bình từ 450.000 đồng trở lên.",
      "tastingTip": "Ăn với cơm trắng nóng. Cá kho lâu nên thịt thấm vị, nhiều người ăn cả xương mềm. Nếu mua về, nên hâm lại nhẹ trước khi ăn. Nên mua trực tiếp tại làng vì giá tại làng nghề thường ưu đãi hơn.",
      "address": "Xóm 13, xã Nam Lý, Ninh Bình (cơ sở Trần Luận), khá gần khu chùa Tam Chúc"
    },
    "2": {
      "cultureStory": "Làng Kiện Khê sản xuất bánh đa theo công thức bí truyền. Bánh làm từ bột gạo xay nhuyễn trộn mè đen, phơi khô thủ công dưới nắng, và có loại tráng cùng lạc, vừng, dừa hoặc gấc. Bánh giòn được bán đi nhiều nơi như Hà Nội, Ninh Bình, Thái Nguyên, Phú Thọ, Hải Phòng. Nhiều người còn chọn nó làm quà mang về.",
      "tastingTip": "Bẻ ăn trực tiếp hoặc nướng nhẹ cho giòn thơm. Hợp ăn vặt, uống trà hoặc làm quà biếu.",
      "address": "Thị trấn Kiện Khê, huyện Thanh Liêm (tên cũ), nơi bánh được làm thủ công"
    },
    "3": {
      "cultureStory": "Cá ngạnh là cá nước ngọt, thịt béo ngọt, có ngạnh nhọn ở vây, thường gặp ở vùng sông nước đồng bằng Bắc Bộ. Phần này mình chưa kiểm chứng được qua các nguồn về Hà Nam, nên không muốn kể thêm chi tiết có thể sai. Bún cá rô đồng thì được nhắc đến như đặc sản Phủ Lý đậm hương vị đồng quê.",
      "tastingTip": "Với bún cá nói chung, nên ăn nóng, thêm rau sống và chanh, ớt theo khẩu vị. Nếu quán có mắm tôm hoặc dưa chua thì thêm chút cho đậm vị."
    }
  },
  "haiduong": {
    "0": {
      "cultureStory": "Bún cá rô đồng là món sáng quen thuộc, mang vị đồng quê của người Hải Dương. Bát bún có sợi bún trắng trong, nước dùng ngọt đậm, rau cải canh thanh mát và thịt cá chiên vàng giòn. Nguyên liệu chính phải là cá rô đồng (cá rô ta), và có quán rim cá với mắm và gừng. Nhiều người Hải Dương còn cho rằng ở quê họ ăn bún cá rô ngon hơn cả bún cá nổi tiếng ở nơi khác.",
      "tastingTip": "Ăn nóng cùng rau cần và thì là. Nên đi sớm, vì một du khách nhận xét đi sớm thì nước dùng đỡ bị mặn. Nhiều quán còn bán cá rim mang về làm quà.",
      "address": "Quán Hải Yến, 27 Yết Kiêu, Bảo Tháp, TP Hải Dương"
    },
    "1": {
      "cultureStory": "Mình chưa kiểm chứng được nguồn gốc món này gắn với Hải Dương nên không kể thêm chuyện có thể sai. Về cách làm, gà được treo vào một chiếc lu nhỏ và nướng bằng than khoảng một tiếng cho đến khi vàng đều và thơm",
      "tastingTip": "Ăn nóng ngay sau khi nướng, chấm muối ớt chanh hoặc ăn kèm rau sống và xôi. Da gà giòn thơm là phần nhiều người thích nhất.",
      "address": "Vua Gà Đất Bắc - Phố Cậy - Bình Giang"
    },
    "2": {
      "cultureStory": "Bánh đậu xanh Hải Dương ra đời từ đầu thế kỷ 20 ở thị xã Hải Dương, với các hiệu xưa như Bảo Hiên, Cự Hương, Mai Phương. Theo một nguồn, vua Bảo Đại sau khi dùng bánh đã khen và cho in hình “Rồng Vàng” lên hộp bánh. Từ đó bánh mang tên “Rồng Vàng Hải Dương.” Món này ngọt vừa phải, bùi và béo, thường là quà biếu hoặc đồ cúng.",
      "tastingTip": "Bánh đậu xanh thường được thưởng thức kèm trà. Bẻ từng miếng nhỏ, ăn chậm cùng chén trà nóng, nhất là trà xanh hoặc trà sen. Vị trà chát nhẹ giúp cân bằng vị béo bùi của bánh.",
      "address": "Bánh đậu xanh Nguyên Hương (địa chỉ chuẩn lâu đời tại 68 Trần Hưng Đạo, Hải Dương)"
    },
    "3": {
      "cultureStory": "Rươi được coi là “lộc trời”, và theo kinh nghiệm người địa phương, rươi xuất hiện nhiều vào các tháng 9, 10 và 11 âm lịch. Dân gian có câu “Tháng chín ăn rươi, tháng mười ăn nhộng”. Rươi Tứ Kỳ nức tiếng thơm ngon: thân mập, nhiều bột, béo ngậy, màu đỏ hồng, không tanh. Vào mùa, người dân thôn An Định nổi tiếng với việc chong đèn bắt rươi trên đồng. Theo lịch âm, hiện đang là đầu mùa chính vụ, nên bạn đang đi đúng dịp.",
      "tastingTip": "Món phổ biến nhất là chả rươi chiên cùng trứng và thịt băm, vị béo ngậy thơm. Ngoài ra còn có canh rươi nấu với măng, rau và lá lốt, hoặc rươi kho niêu đất. Rươi nên ăn khi còn tươi và chỉ nên ăn vừa phải, khoảng 50–100g mỗi ngày. Người dị ứng hải sản, hen suyễn, bà bầu và trẻ em không nên ăn nhiều.",
      "address": "Nhà hàng Thái Hòa, xã An Thanh, huyện Tứ Kỳ (nổi tiếng với món canh rươi)"
    }
  },
  "hungyen": {
    "0": {
      "cultureStory": "Phố Hiến từng là một thương cảng sầm uất ở thế kỷ 17, nơi người Hà Lan và người Anh từng lập thương điếm, và có câu “nhất Kinh Kỳ, nhì Phố Hiến”. Bún thang lươn khác bún thang Hà Nội ở chỗ có lươn đồng chiên giòn. Một bát đầy đủ có hơn 20 nguyên liệu, với nước dùng ninh từ xương và đầu lươn, ngọt thanh và thơm gừng. Món này còn được xếp vào Top 100 món ăn đặc sản Việt Nam.",
      "tastingTip": "Ăn nóng, thêm rau sống và chút mắm tôm tùy khẩu vị. Hãy trộn đều lươn, thịt ba chỉ chiên, trứng thái chỉ và giò lụa với bún để thấy rõ nhiều tầng vị.",
      "address": "(TP Hưng Yên) Bún thang lươn Phố Hiến Xưa, số 16 Trần Quang Khải"
    },
    "1": {
      "cultureStory": "Chả gà Tiểu Quan là đặc sản nổi tiếng hơn 100 năm ở huyện Khoái Châu. Món này thường xuất hiện vào các dịp lễ, Tết, và người làng chọn gà rất kỹ rồi chế biến qua nhiều công đoạn cẩn thận. Miếng chả thành phẩm có màu vàng đậm, vị ngọt đậm đà, giòn dai và thơm lừng",
      "tastingTip": "Chả gà thường ăn kèm xôi hoặc cơm trắng, nhưng ăn không cũng ngon. Khi mua, nên chọn miếng có màu vàng óng và kết dính tốt, không rời rạc.",
      "address": "Thôn Tiểu Quan, Khoái Châu, Hưng Yên (cơ sở Quang Duy)"
    },
    "2": {
      "cultureStory": "Tương Bần là loại nước chấm truyền thống ủ từ đậu tương, gạo nếp và muối hạt, không chất bảo quản. Từ xưa, tương Bần đã được dùng để tiến vua. Làng nghề Bần Yên Nhân cách Hà Nội khoảng 25 km và có lịch sử hàng trăm năm. Mỗi mẻ tương mất khoảng một đến hai tháng và phụ thuộc nhiều vào thời tiết.",
      "tastingTip": "Đậu phụ nướng vàng, ăn nóng và chấm tương Bần, thêm chút gừng thái chỉ, tỏi hoặc ớt cho đậm vị. Phần nướng này là cách ăn phổ biến mình gợi ý, không phải một công thức đã được kiểm chứng. Nếu bạn muốn thử cách có sẵn, tương Bần cũng hợp với lạc dầm hoặc đậu phụ hấp tương Bần",
      "address": "Tương Bần: Tương Bần Thành Đạt, tổ dân phố Cộng Hòa, Mỹ Hào và cửa hàng Hường Đạt, số 19 quốc lộ 5, thị trấn Bần. Đậu phụ: Đậu phụ An Vỹ cũng được liệt kê là đặc sản Hưng Yên"
    },
    "3": {
      "cultureStory": "Gà Đông Tảo là giống gà quý hiếm, được nuôi nhiều đời ở Khoái Châu để tiến vua hoặc dùng cúng tế đình, chùa. Điểm nổi bật là đôi chân to như “chân voi”. Tri thức nuôi và chế biến gà này đã được đưa vào Danh mục di sản văn hóa phi vật thể quốc gia. Gà thường được săn đón vào dịp Tết, nên giáp Tết hay “cháy hàng”.",
      "tastingTip": "Một vị khách chia sẻ với AFP rằng thứ ngon nhất của gà Đông Tảo là da chân. Thịt gà dai, ít mỡ nên thường được luộc hoặc hấp để giữ vị. Ăn kèm muối tiêu chanh hoặc nước chấm gừng, và đừng bỏ qua phần chân gà. Gà thuần chủng có giá khá cao, nên bạn nên đặt trước, nhất là trước Tết. Nam Định đã sáp nhập vào tỉnh Ninh Bình mới, nên nhiều bài viết ghi địa chỉ là “Ninh Bình”. Mình giữ tên đường và phường quen thuộc ở thành phố Nam Định để bạn dễ tìm. Ở Nam Định, phần lớn hàng quán mở vào buổi chiều, nên bạn nên kiểm tra giờ trước khi đi. Món cá nướng trui mình chưa xác nhận được ở Nam Định, nên ghi rõ ở phần cuối.",
      "address": "Nhà hàng Văn Hạnh Quán, chợ đầu mối Đông Tảo, xã Đông Tảo, Khoái Châu"
    }
  },
  "namdinh": {
    "0": {
      "cultureStory": "Nam Định được coi là cái nôi địa lý của phở, dù quê hương tinh thần của phở là Hà Nội. Điểm ấn tượng của phở Nam Định là sợi phở to bản, mềm mượt, và thịt bò được thái lát mỏng rồi băm dần cho mềm nhuyễn mà không đứt rời. Nước dùng được mô tả là đậm đà và béo hơn phở Hà Nội, và người Nam Định thường nêm cả nước mắm làm từ tôm cá biển. Cách thưởng thức Nếm nước dùng trước, rồi thêm hành, chút chanh hoặc ớt tùy khẩu vị. Ở Cụ Tặng, hai món nổi tiếng nhất là phở bò sốt vang và phở áp chảo.",
      "address": "Phở Cụ Tặng, 23 Hàng Tiện"
    },
    "1": {
      "cultureStory": "Tên gọi bún đũa bắt nguồn từ sợi bún to, dài như chiếc đũa, mềm nhưng săn chắc, không nhũn. Món này gần giống bánh canh miền Nam nhưng có nét riêng. Bún được chan nước riêu cua có vị ngọt đậm, hơi chua, thơm mùi cua đồng. Đây là món dân dã mà người Nam Định, từ già đến trẻ, đều quen thuộc.",
      "address": "Bún đũa bà Bảy, đối diện chợ Hoàng Ngân"
    },
    "2": {
      "cultureStory": "Bánh xíu páo có nguồn gốc từ người Hoa. “Xíu” là thịt xá xíu, “páo” là bánh bao, nên tên gọi là bánh bao có nhân xá xíu. Phố Khách, nay là khu Hoàng Văn Thụ và Lê Hồng Phong, từng là nơi cộng đồng người Hoa sinh sống và nảy sinh các lò bánh truyền thống. Bánh có lớp vỏ ngàn lớp, vàng ươm, nhân thịt heo quay thơm béo, và được người Hoa dùng cho bữa sáng hoặc quà chiều.",
      "address": "Quán Kim Ngân, số 10 Nguyễn Văn Trỗi"
    },
    "3": {
      "cultureStory": "Mình không tìm được nguồn xác nhận câu chuyện của món này ở Nam Định, nên không muốn kể thêm chi tiết có thể sai.",
      "address": "Cá nướng Tú Đào - Xã Giao Hưng, Huyện Giao Thủy, Nam Định"
    }
  },
  "ninhbinh": {
    "0": {
      "cultureStory": "Quán miến lươn Bà Phấn xuất hiện từ những năm 1960 và được xem là \"địa chỉ gốc\" của hương vị truyền thống. Khác với nhiều quán, Bà Phấn không trộn miến và lươn với nhau mà để nước dùng và lươn riêng biệt trong một tô. Nước dùng ninh từ xương lươn nên hơi đục nhưng ngọt, và lươn ở đây là lươn mềm chứ không giòn như kiểu Hà Nội.",
      "tastingTip": "Ăn nóng vào buổi sáng, thêm hành, tiêu và chút ớt tùy khẩu vị. Một số quán chỉ bán buổi sáng hoặc đóng cửa sớm, nên bạn nên kiểm tra giờ trước khi đi.",
      "address": "Miến lươn Mạnh Toàn, 995 Trần Hưng Đạo"
    },
    "1": {
      "cultureStory": "Cơm cháy Ninh Bình được Tổ chức kỷ lục Châu Á công nhận theo bộ tiêu chí \"Giá trị ẩm thực Châu Á\" và nằm trong Top 50 món đặc sản Việt Nam. Cơm cháy thường được phơi khô, bọc kín, và khi ăn mới chiên giòn. Món này thường ăn cùng các món từ thịt dê núi và rượu Kim Sơn. Phiên bản chà bông là cơm cháy giòn phủ lớp chà bông mặn thơm mùi thịt.",
      "tastingTip": "Ăn khi vừa chiên, còn giòn nóng. Chà bông ăn kèm nên rắc lên ngay trước khi ăn để không bị mềm. Món này cũng hợp ăn kèm các món dê núi.",
      "address": "Trụ sở sản xuất: Thôn Hưng Hiền, xã Yên Mô, tỉnh Ninh Bình"
    },
    "2": {
      "cultureStory": "Quán Đức Trọc ban đầu chỉ bán thịt xiên hoặc bánh mì, sau này mới thêm bánh tôm. Quán không cầu kỳ hay sang trọng nhưng được nhiều người Ninh Bình yêu thích. Mình chưa tìm được nguồn xác nhận về nguồn gốc món này ở Ninh Bình, nên không kể thêm.",
      "tastingTip": "Ăn nóng, giòn ngay khi mới chiên, chấm nước chấm chua ngọt và ăn kèm rau sống. Đây là cách ăn phổ biến mình gợi ý.",
      "address": "Đức Trọc – Bánh tôm, thịt nướng, 39 Hoàng Hoa Thám, Vân Giang (địa chỉ theo bài viết"
    },
    "3": {
      "cultureStory": "Dê Ninh Bình được chăn thả trên núi đá, nên thịt săn chắc, ít mỡ và thơm ngon hơn dê nuôi ở nơi khác. Món nổi tiếng nhất là tái dê chanh, và người ta cho rằng chỉ có tương Bần Hưng Yên mới \"xứng\" với tái dê Ninh Bình. Cơm cháy giòn tan là món đi kèm đặc trưng mà các quán dê ở nơi khác không có. Một lưu ý: có nhiều quán gắn bảng \"dê núi\", nhưng dê núi chính hiệu phải sống trên núi chứ không phải dê nuôi nấu kiểu núi.",
      "tastingTip": "Mình không tìm được định nghĩa chuẩn của bộ \"7 món\", vì mỗi quán có thực đơn khác nhau. Các món thường gặp gồm tái dê, dê nướng ngũ vị, dồi dê chiên, dê núi nhúng mẻ, cháo dê, dê xào xả ớt và dê ủ trấu. Bạn nên hỏi quán bộ 7 món gồm những gì. Tái dê chấm tương Bần cùng rau thơm, và ăn với cơm cháy để cân vị. Nếu có tiết canh dê thì cân nhắc kỹ về an toàn thực phẩm.",
      "address": "Nhà hàng Đức Dê, số 29 ngõ 458 Nguyễn Huệ"
    }
  },
  "thaibinh": {
    "0": {
      "cultureStory": "Bún bung là món ăn sáng truyền thống của người Thái Bình, tên gọi xuất phát từ cách nấu nguyên liệu cho đến khi mềm nhừ, \"bung\" ra. Điểm khác biệt lớn nhất so với các loại bún khác nằm ở việc sử dụng hoa chuối và chả lá xương sông, nước dùng có màu hơi đục do nhựa hoa chuối tiết ra, vị ngọt của xương hòa quyện với vị chát nhẹ của hoa chuối, tạo nên hương vị \"của quê hương\" khó quên.",
      "tastingTip": "Trong bát có bún, móng giò, thịt chân giò, chả xương sông và hoa chuối. Khi ăn nên dùng kèm các loại rau thơm như tía tô, kinh giới, rau muống chẻ, chấm với nước mắm. Nhân đây nếm thử một miếng nước dùng, cảm nhận vị ngọt thanh tự nhiên, sau đó thêm chút ớt để tăng vị.",
      "address": "(tại thành phố Thái Bình): Bún bung Trần Khánh Dư: Số 109 đường Trần Khánh Dư, phường Bồ Xyên, thành phố Thái Bình"
    },
    "1": {
      "cultureStory": "Diêm Điền là thị trấn ngư nghiệp ven biển, cư dân sống bằng nghề đánh bắt hải sản quanh năm, sứa là một trong những nguyên liệu đặc sản địa phương. Nộm sứa Diêm Điền đại diện cho phong cách ẩm thực của cư dân vùng biển, sử dụng sứa tươi kết hợp với các loại rau thơm, thể hiện sự tôn trọng hương vị tươi ngon tự nhiên của nguyên liệu.",
      "tastingTip": "Sứa sau khi sơ chế có kết cấu giòn dai, trộn với xoài xanh, cà rốt, các loại rau thơm, rắc đậu phộng rang. Vị chua ngọt đến từ chanh, đường, ớt, đậu phộng bùi bùi, rau thơm thanh mát. Là món khai vị rất thích hợp cho mùa hè, cũng có thể dùng kèm với bánh đa nướng hoặc bánh phồng tôm.",
      "address": "Nhà hàng Trường Sinh Diêm Điền - Số 313, Khu 6, thị trấn Diêm Điền, huyện Thái Thụy, tỉnh Thái Bình"
    },
    "2": {
      "cultureStory": "Bánh cáy từng là vật phẩm tiến vua, có lịch sử lâu đời, truyền thuyết kể rằng tên gọi xuất phát từ vua khen \"bánh cay\" mà thành. Bánh có năm màu (đỏ, vàng, trắng, đen, xanh), tượng trưng cho ngũ hành, kết hợp hương vị ngọt, cay, bùi, béo, vừa là món ăn vặt ngày Tết của người dân địa phương, vừa là món quà biếu thể hiện tấm lòng của đất Thái Bình.",
      "tastingTip": "Bánh cáy có vị dẻo, ngọt, cay nồng của gừng, cắn một miếng sẽ cảm nhận được các loại hạt và vị mứt bên trong. Truyền thống nhất là dùng kèm trà nóng, vị trà hơi đắng giúp cân bằng vị ngọt của bánh, làm nổi bật mùi thơm của gừng, vừng, lạc, càng ăn càng nghiện.",
      "address": "Làng Nguyễn, xã Nguyên Xá, huyện Đông Hưng, tỉnh Thái Bình"
    },
    "3": {
      "cultureStory": "Canh cá Quỳnh Côi có lịch sử từ thế kỷ 17, tuy gọi là \"canh\" nhưng thực chất là món ăn sáng dạng bánh đa cá, tương tự như phở. Điểm đặc biệt nằm ở bánh đa Quỳnh Côi (sợi bánh đa gạo mỏng, trắng trong, đàn hồi) và cá rô đồng rim vàng, nước dùng nấu từ xương cá và xương heo, ngọt thanh không dùng giấm chua hay cà chua.",
      "tastingTip": "Nhân lúc nóng, cá rim có màu vàng đẹp mắt, thịt săn chắc, có thể ăn kèm rau cần, thì là và các loại rau thơm khác. Nước dùng có vị ngọt thanh, bánh đa giòn dai. Nêm thêm chút nước quất chanh để tăng vị thanh mát, rất thích hợp cho bữa sáng, đặc biệt là mùa đông ăn vào rất ấm bụng",
      "address": "Canh cá Phúc Tửu: 118 Hai Bà Trưng, Lô 6 Kỳ Bá, và 39 Phan Bội Châu (TP. Thái Bình)"
    }
  },
  "vinhphuc": {
    "0": {
      "cultureStory": "Bánh hòn là món ăn truyền thống không thể thiếu của người dân Vĩnh Phúc trong các dịp lễ Tết, cúng giỗ, tiệc cưới, địa vị của nó sánh ngang với giò chả, chả nem. Phong tục làm bánh hòn tại địa phương Hương Canh và các nơi khác đã được truyền qua nhiều thế hệ, nhiều gia đình tụ họp vào dịp Tết để cùng nhau nặn bánh, vừa là để thưởng thức, vừa là để truyền dạy cho con cháu kỹ thuật truyền thống. Bánh có kích thước bằng quả chanh hoặc quả bóng bàn, vẻ ngoài giản dị nhưng tượng trưng cho “món quà quê nhà”.",
      "tastingTip": "Bánh hòn nên ăn khi còn nóng, vỏ ngoài là bột gạo tẻ hấp chín có màu trắng trong, nhân là thịt heo, mộc nhĩ, hành lá, đôi khi có thêm lạc rang để tăng vị bùi. Khi ăn có thể chấm với nước mắm pha loãng (tương tự nước chấm bánh cuốn), hoặc kết hợp với cháo se — đây là cách ăn đặc trưng nhất tại địa phương Hương Canh, vị dẻo của bánh kết hợp với độ sánh mịn của cháo, rất đặc biệt.",
      "address": "Hương Canh (thị trấn Hương Canh, huyện Bình Xuyên): Nơi khởi nguồn của bánh hòn, thường ăn kèm với “cháo se”"
    },
    "1": {
      "cultureStory": "Bò tái kiến đốt là đặc sản độc đáo của vùng Tam Đảo, nguyên lý là lợi dụng kiến rừng đốt thịt bò để tạo hương vị đặc biệt. Các loại kiến khác nhau mang lại hương vị khác nhau: kiến vống đen tạo mùi thơm hắc, kiến vống đỏ mang vị chua, kiến bò nhọt tạo vị cay. Món ăn này đã được Tổ chức Kỷ lục Việt Nam đưa vào danh sách “Top 100 món ăn đặc sản Việt Nam” năm 2022. Trước đây món ăn này không phổ biến trong bữa ăn hàng ngày do chế biến tốn nhiều công sức, hiện nay được một số nhà hàng khôi phục và phục vụ du khách.",
      "tastingTip": "Thịt bò sau khi được kiến đốt sẽ được rửa qua nước muối loãng, sau đó nướng trên than hồng đến chín tái, bên ngoài hơi xém, bên trong có màu hồng, thịt mềm mọng nước. Khi ăn cắt thành miếng nhỏ, dùng kèm rau ngổ, khế chua, chuối xanh và các loại rau thơm khác, gói lại chấm với nước tương đặc chế từ ngô và đậu tương, thêm chút đường và gừng sợi. Giá tham khảo khoảng 150.000–200.000 đồng/đĩa (đủ cho 2 người).",
      "address": "nhà hàng: Nhà hàng Phúc Hương Viên: Km 11+600, QL2B, thôn Tân Long, Tam Đảo"
    },
    "2": {
      "cultureStory": "\"Bánh đúc Kẻ Đanh, rau hành Kẻ Mỏ\" là câu cửa miệng lưu truyền ở vùng Yên Lạc, cho thấy bánh đúc nơi đây từ lâu đã có tiếng tăm riêng. Món bánh này bắt nguồn từ những năm 1960, ban đầu là món ăn dân dã do người dân làng gánh đi bán khắp các chợ, dần dần trở thành ký ức chung của người dân địa phương. Hiện nay bánh đúc Kẻ Đanh không chỉ xuất hiện trong bữa ăn hàng ngày của người dân địa phương mà còn là món ăn quen thuộc trong mâm cỗ cưới hỏi, tiệc làng, mang theo ký ức văn hóa của người dân vùng quê.",
      "tastingTip": "Cách ăn truyền thống nhất là chấm với tương Bần. Tương Bần vị đậm, hơi mặn, vị bùi của lạc và vị thơm của vừng trong bánh đúc kết hợp với nhau, càng ăn càng thấy đậm đà. Món bánh này cũng có thể ăn kèm với canh cua, nước riêu v.v., theo người dân địa phương thì như vậy còn ngon hơn.",
      "address": "Làng Đinh Xá (tên cổ là Kẻ Đanh), xã Nguyệt Đức, huyện Yên Lạc, tỉnh Vĩnh Phúc"
    },
    "3": {
      "cultureStory": "Lập Thạch là vùng đất trũng, mùa mưa đồng ruộng ngập nước, mỗi năm chỉ cấy được một vụ, cá tự nhiên phong phú. Người dân địa phương để bảo quản lượng cá dư thừa đã nghĩ ra phương pháp ướp muối rồi ủ với thính gạo, theo thời gian phát triển thành một món đặc sản độc đáo. Món ăn này gắn bó với người dân Lập Thạch hàng trăm năm, là món ăn thường ngày, cũng là món ngon không thể thiếu trên mâm cơm Tết, mang theo ký ức ẩm thực của người dân vùng trũng miền Bắc.",
      "tastingTip": "Cá thính có vị chua dịu, hương thơm nồng của thính gạo. Cách ăn phổ biến nhất là nướng trên than hoa hoặc rán vàng, ăn kèm cơm trắng nóng, rau sống, có thể chấm nước mắm tỏi ớt. Một số người cũng dùng để cuốn với lá sung, thêm thịt ba chỉ luộc và dưa chua để tăng thêm tầng hương vị.",
      "address": "Cá thính Bà Thực, thôn Minh Trụ, xã Tiên Lữ, huyện Lập Thạch, Vĩnh Phúc"
    }
  },
  "bacninh": {
    "0": {
      "cultureStory": "Bánh khúc làng Diềm không chỉ là một món quà quê, mà còn là một phần của di sản văn hóa Quan họ Bắc Ninh. Nguồn gốc lâu đời: Không ai nhớ chính xác bánh có từ bao giờ, nhưng người dân truyền tai nhau rằng bánh xuất hiện từ thời Vua Bà, song hành cùng sự ra đời của các làn điệu dân ca Quan họ. Nghề làm bánh được gìn giữ qua nhiều thế hệ. Gắn liền với văn hóa Quan họ: Bánh khúc là món ăn quan trọng trong \"Mâm cỗ Quan họ\" hoặc tiệc trà bánh, thể hiện sự trân trọng và nét thanh lịch trong giao tiếp của người Kinh Bắc. Trong các dịp lễ hội của làng như hội Đền Vua Bà (mùng 6 tháng 2 âm lịch) hay hội tát giếng (mùng 3 tháng 3 âm lịch), bánh khúc thường được dùng để thết đãi khách quý.",
      "tastingTip": "Để cảm nhận trọn vẹn hương vị của bánh khúc làng Diềm, bạn nên lưu ý những điểm sau: Thời điểm ngon nhất: Bánh ngon nhất khi thưởng thức ngay lúc còn nóng, vừa mới ra lò. Lúc này vỏ bánh bóng loáng, dẻo dai và tỏa mùi thơm đặc trưng. Hương vị đặc trưng: Vỏ bánh làm từ gạo tẻ (thường là Khang dân hoặc 203) nên dẻo vừa phải, hòa quyện cùng màu xanh và mùi thơm của rau khúc. Nhân bánh có vị bùi béo của đậu xanh, vị đậm đà của thịt ba chỉ và mộc nhĩ, thêm chút cay nồng của hạt tiêu. Hình dáng độc đáo: Bánh được nặn theo hình tai mèo với vỏ mỏng nhưng khéo léo không để lộ nhân ra ngoài. Lưu ý khi mua: Bánh không có chất bảo quản, nên tốt nhất là ăn trong ngày. Nếu mua về, bạn có thể yêu cầu mua bánh sống để bảo quản được lâu hơn và hấp lại khi cần"
    },
    "1": {
      "cultureStory": "Chim ngói là loài chim di cư, xuất hiện vào mùa thu, ăn lúa mới nên thịt đặc biệt béo ngậy và thơm ngon. Dân gian có câu \"chim ngói mùa thu, chim cu mùa hè\", chim ngói mùa thu là ngon nhất. Bắc Ninh là vùng trồng lúa, mùa thu chim ngói tập trung thành đàn trên đồng ruộng, người dân địa phương bắt chim ngói và chế biến thành món ăn, dần dần hình thành nên phong tục ẩm thực này.",
      "tastingTip": "Chim ngói hầm thường được chế biến bằng cách tẩm ướp với hạt sen, nấm hương, miến, thịt ba chỉ rồi đem hầm, thịt chim mềm ngọt, đến xương cũng mềm, vị tươi ngon của thịt chim thấm vào các nguyên liệu bổ trợ, rất bổ dưỡng. Truyền thống nhất là kết hợp chim ngói với xôi nếp cái hoa vàng, thịt chim béo ngậy hòa quyện với xôi dẻo, rắc thêm hành phi, đậu xanh, cắn một miếng thơm ngon vô cùng."
    },
    "2": {
      "cultureStory": "Bánh phu thê có nguồn gốc từ Đình Bảng, truyền thuyết kể rằng vào thời Lý, một người vợ làm bánh cho chồng đi đánh trận, nhà vua ăn thấy ngon và cảm động trước tình nghĩa vợ chồng nên đã đặt tên là \"bánh phu thê\". Món bánh này tượng trưng cho tình nghĩa vợ chồng thủy chung, là lễ vật không thể thiếu trong lễ cưới hỏi của người dân Kinh Bắc.",
      "tastingTip": "Bánh phu thê được bán theo cặp, đặc biệt không nên ăn ngay khi vừa mới ra lò, ngon nhất là sau khi làm một ngày một đêm mới thưởng thức, khi đó bánh vừa dẻo vừa dai vừa mềm, không dính lá. Bánh có vỏ ngoài màu vàng trong suốt, ăn vào cảm nhận được vị dẻo của nếp, vị giòn của đu đủ sợi, vị bùi ngọt của nhân đậu xanh. Thích hợp nhất là dùng kèm một tách trà nóng, trà làm dịu vị ngọt của bánh, làm nổi bật hương thơm."
    },
    "3": {
      "cultureStory": "\"Trâu giật\" không phải là tên một món ăn, mà là một hiện tượng: trâu sau khi được giết mổ theo phương pháp truyền thống, thớ thịt vẫn còn co giật trên thớt, điều này đại diện cho thịt trâu mới giết cực kỳ tươi ngon. Thịt trâu Từ Sơn được đánh giá là ngon nhất, một phần quan trọng là vì độ tươi \"từ trang trại đến bàn ăn\" này.",
      "tastingTip": "Thực đơn chủ yếu là các món thịt trâu, phổ biến nhất là trâu nhúng giấm, trâu xào, lẩu trâu, phở xào. Thịt trâu mềm dai vừa phải, không dai cứng. Món đặc biệt nhất là trâu nướng muối trứng kiến, cách chế biến công phu, hương vị độc đáo, chỉ có ở đây. Giá cả tương đối phải chăng, khoảng 100.000 đồng/người là có thể ăn no."
    }
  },
  "bacgiang": {
    "1": {
      "cultureStory": "Gà đồi Yên Thế có nguồn gốc từ sự lai tạo giữa gà ri, gà Hồ và gà Đông Cảo, đặc trưng là lông đỏ, chân vàng, mào đỏ, thịt chắc thơm. Yên Thế chọn gà là ngành chủ lực để phát triển chăn nuôi, tận dụng địa hình đồi núi và mật độ dân số thấp để giảm dịch bệnh, các hộ nhỏ lẻ cũng có thể tham gia. Hiện nay thương hiệu gà đồi Yên Thế đã lan rộng đến Hà Nội, Hải Phòng, Quảng Ninh và nhiều nơi khác.",
      "tastingTip": "Cách ăn truyền thống và được đánh giá cao nhất là luộc chín tới. Thịt gà dai ngọt, chấm với muối trộn lá chanh, nước luộc giữ lại vị ngọt tự nhiên để chan cơm, càng ăn càng thấy rõ sự khác biệt về chất lượng của gà đồi.",
      "address": "tham khảo: Nhà hàng Rùa Vàng (thành phố Bắc Giang): Số 1 Hùng Vương, Phường Lê Lợi (TUTA Center)"
    },
    "2": {
      "cultureStory": "Thôn Đồng Quan nằm bên bờ sông Thương, nghề làm bánh đúc đã truyền qua nhiều thế hệ, là một trong những đặc sản trứ danh của Bắc Giang. Điểm độc đáo của bánh đúc nơi đây nằm ở nước vôi nướng: dùng vôi cục nướng qua rồi hòa với nước, lấy phần nước trong để trộn bột, giúp bánh vừa dai vừa có mùi thơm nhẹ, là điểm khác biệt cốt lõi so với bánh đúc thông thường.",
      "tastingTip": "Bánh đúc chín đổ ra mẹt lót lá chuối tươi, mặt bánh rắc đầy lạc rang và sợi dừa, trắng ngần mịn mượt. Cách ăn chính thống nhất là chấm với tương Bần—tương Bần là loại tương nổi tiếng miền Bắc, vị đậm, hơi mặn, kết hợp với vị ngọt thanh của bánh đúc, mùi thơm nhẹ của nước vôi, vị bùi béo của lạc và dừa, là sự kết hợp kinh điển của ẩm thực Bắc Giang. Lưu ý bánh đúc là thực phẩm tươi sống, không thể để qua ngày hoặc vận chuyển đường dài, tốt nhất nên thưởng thức trong ngày.",
      "address": "tham khảo: Điểm gốc: Thôn Đồng Quan, xã Đồng Sơn, thành phố Bắc Giang, nơi đây có truyền thống làm bánh đúc lâu đời"
    },
    "3": {
      "cultureStory": "Khâu nhục (còn gọi là khau nhục, nằm khâu) có nguồn gốc từ Trung Quốc, du nhập vào Việt Nam, là món ăn truyền thống của người Hoa tại Bắc Giang. Tại Sơn Động, khâu nhục là món không thể thiếu trong ngày Tết, lễ cưới, mừng nhà mới, sinh nhật, mang ý nghĩa cầu mong cuộc sống sung túc. Chế biến khâu nhục cực kỳ cầu kỳ: thịt ba chỉ luộc chín rồi dùng tăm tre châm kỹ da, quét mật ong, chiên ngập dầu đến khi bì vàng giòn, sau đó rắc nhân (thịt nạc băm, nấm hương, mộc nhĩ, các loại gia vị) và hấp cách thủy 2–3 giờ cho thịt mềm nhừ, gia vị thấm đều.",
      "tastingTip": "Khâu nhục thành phẩm thịt mềm, béo ngậy nhưng không ngấy, phần bì vàng óng có độ dai nhẹ. Cách ăn truyền thống là kết hợp với dưa muối, hành muối, vị chua của dưa làm dịu đi độ béo của thịt, càng ăn càng ngon miệng. Thông thường khâu nhục được úp ngược ra đĩa, giữ nguyên hình tròn theo khuôn bát, có thể ăn kèm cơm trắng hoặc dùng làm món chính trong bàn tiệc.",
      "address": "Xã Yên Định, huyện Sơn Động, Bắc Giang"
    }
  },
  "backan": {
    "0": {
      "cultureStory": "Cây trồng đến trước, nghề làm miến đến sau. Cây dong riềng được đưa vào trồng tại khu vực Côn Minh, Na Rì từ đầu những năm 1970, ban đầu chỉ với diện tích nhỏ lẻ, sau đó mở rộng dần. Đến đầu những năm 1990, khi những người dân từ đồng bằng lên Côn Minh lập nghiệp mang theo kỹ thuật làm miến dong, người dân địa phương mới bắt đầu chế biến củ dong riềng thành miến. Cũng có tài liệu ghi nhận nghề làm miến dong tại Na Rì \"đã có từ những năm 1960\", hoặc \"được làm thủ công từ năm 1965\", nhưng dù tính từ mốc nào, đây đều là câu chuyện kéo dài hơn nửa thế kỷ của một nghề thủ công vùng núi.",
      "tastingTip": "Về cách thưởng thức miến dong Bắc Kạn, điểm cốt lõi là không nấu quá lâu, ngâm trước rồi mới nấu. Miến dong Côn Minh Na Rì làm từ 100% bột dong riềng, không thêm phụ gia, sợi miến dai, nấu lâu không bị nát. Cách thưởng thức phổ biến nhất là nấu canh hoặc xào, cũng có thể dùng cho lẩu.",
      "address": "Xã Côn Minh, huyện Na Rì, tỉnh Bắc Kạn (Thương hiệu OCOP 5 sao quốc gia)"
    },
    "1": {
      "cultureStory": "Cá sông Năng đến từ vùng nước chảy xiết dưới chân thác Đầu Đẳng, nổi tiếng nhất là cá lăng đen, được người dân địa phương gọi là \"đặc sản trời cho\". Loại cá này sống ở ghềnh đá nước xiết, rất khó đánh bắt, ngư dân phải dùng câu, lưới và các phương pháp truyền thống mới có thể bắt được, có con nặng tới 30kg. Cá nướng Pác Ngòi lại chọn loại cá nhỏ cỡ ngón tay, sau khi làm sạch đồ chín, kẹp bằng kẹp tre phơi nắng 3–4 ngày, khi ăn nướng trên than hồng, là hương vị mà du khách đến hồ Ba Bể không thể bỏ qua.",
      "tastingTip": "Cá nướng Pác Ngòi bên ngoài giòn, bên trong vẫn mềm ẩm, chấm với tương ớt hoặc muối mắc khén là đủ. Cá lăng đen tại nhà hàng thường được chế biến thành các món canh cá, cá nướng, v.v., thịt chắc và ít xương, phù hợp để thưởng thức cùng gia đình. 🍡 Bánh ngải",
      "address": "Khu vực hồ Ba Bể / thôn Pác Ngòi: Cá nướng Pác Ngòi là món ăn đường phố dọc bờ hồ Ba Bể, giá khoảng 10.000–15.000 đồng/xiên"
    },
    "2": {
      "cultureStory": "Bánh ngải là món ăn truyền thống của người Tày, nguyên liệu chính là lá ngải cứu, gạo nếp nương, vừng và đường phên. Người Tày coi lá ngải cứu là \"vị thuốc\", tin rằng có thể thúc đẩy tuần hoàn máu, làm ấm cơ thể, hỗ trợ tiêu hóa, vì vậy bánh ngải không chỉ là món ăn mà còn mang ý nghĩa dưỡng sinh. Theo phong tục truyền thống, người Tày làm bánh ngải trong các dịp lễ hội như cầu mùa, mừng lúa mới, giỗ họ, Tết Nguyên đán.",
      "tastingTip": "Bánh ngải chia làm loại có nhân và không nhân. Nhân thường là đậu xanh, lạc hoặc vừng trộn với đường phên. Vỏ bánh làm từ gạo nếp nương đồ chín giã nhuyễn trộn với lá ngải cứu, có màu xanh bóng, vị dai, hương thơm nhẹ của ngải cứu hòa quyện với vị ngọt của đường phên, ăn không hề ngấy.",
      "address": "Chợ phiên Nghĩa Tá (huyện Chợ Đồn): Có bán bánh ngải"
    },
    "3": {
      "cultureStory": "Lợn sữa quay là món ăn xuất hiện trong các dịp lễ hội, tiệc tùng, cúng bái của Bắc Kạn. Chế biến rất cầu kỳ: cả con lợn sau khi làm sạch, nhồi vào bụng các loại gia vị như quả mắc mật, tai hồi, thảo quả, quế, sau đó quay trên than hồng, trong quá trình quay liên tục lau da để tránh cháy, gần chín thì dùng que xiên để mỡ chảy ra, đảm bảo da giòn thịt mềm.",
      "tastingTip": "Lợn sữa quay thành phẩm có da vàng giòn, thịt ngọt mềm, mang hương thơm của mắc mật và các loại gia vị. Thường chặt miếng bày đĩa, có thể ăn trực tiếp hoặc chấm với nước chấm, là \"món ăn chủ lực\" trong các dịp lễ tết và chiêu đãi khách quý.",
      "address": "Nhà hàng Phúc Khánh: Ngay bờ hồ Ba Bể"
    }
  },
  "caobang": {
    "0": {
      "tastingTip": "Nước dùng phở vịt quay thường nhạt hơn phở bò, nhấn mạnh vị tươi ngon của vịt quay. Thịt vịt thái miếng đặt lên trên sợi phở, chan nước dùng nóng. Có thực khách phản ánh nước dùng của một số quán hơi nhạt, sợi phở nhỏ, đề nghị khi gọi có thể nhờ quán nêm nếm đậm đà hơn. Nếu thích ăn cay, có thể thêm tương ớt hoặc ớt ngâm địa phương.",
      "address": "Phở Vịt Dung Thịnh: Số 065 Đường 3/10, Sông Bằng, Cao Bằng"
    },
    "1": {
      "tastingTip": "Da vịt sau khi quay có màu vàng óng, giòn, thịt mềm ngọt. Cách chế biến rất cầu kỳ: nước sốt gia vị được rót từ từ vào bụng vịt, sau đó dùng lạt tre khâu kín, bên ngoài quét mật ong và giấm rồi nướng trên than hoa, giúp da giòn và thịt không bị khô. Ăn kèm với lá mắc mật sẽ càng thơm hơn.",
      "address": "Quán vịt quay Dũng Liên: Đường Đề Thám (quốc lộ 3 cũ), thành phố Cao Bằng"
    },
    "2": {
      "tastingTip": "Bánh cuốn tráng mỏng, nhân là thịt băm xào hoặc trứng gà. Khi ăn cho bánh vào bát, chan nước xương nóng, thêm măng ngâm ớt, rau mùi, tương ớt. Có thể dùng thìa xắn bánh cùng nước dùng để ăn, vừa có độ dẻo của bánh, vừa có vị ngọt thanh của nước xương, vừa có vị cay chua của măng ớt để kích thích vị giác. 🍪 Bánh khảo",
      "address": "Bánh cuốn Bà Hồng: Khu vực thành phố Cao Bằng"
    },
    "3": {
      "tastingTip": "Bánh khảo có kết cấu bùi, thơm, khi ăn tan trong miệng. Thường ăn trực tiếp, hoặc dùng kèm trà nóng. Vì bánh khá ngọt, trà có thể cân bằng vị giác. Đóng gói bánh khảo mua về cũng tiện lợi, phù hợp làm quà biếu.",
      "address": "Bánh Khảo Sơn Tòng: Số 29 tổ 22, Thục Phán, Cao Bằng"
    }
  },
  "hagiang": {
    "0": {
      "cultureStory": "Điểm khác biệt cốt lõi của bánh cuốn Hà Giang so với miền xuôi nằm ở nước chấm: không dùng nước mắm chua ngọt, mà dùng nước xương ống ninh 3–6 giờ, nước trong, vị ngọt thanh, thường thêm giò thái lát, hành lá, rau mùi. Cách ăn này được cho là liên quan đến khí hậu lạnh giá của vùng cao nguyên đá, một bát nước xương nóng giúp làm ấm cơ thể, cũng làm nổi bật vị béo của trứng lòng đào và độ mềm của vỏ bánh. Bánh cuốn thường có hai loại nhân: thịt băm mộc nhĩ, hoặc trứng gà lòng đào.",
      "tastingTip": "Thưởng thức khi còn nóng, có thể chấm hoặc chan trực tiếp nước xương. Bánh cuốn nhân trứng bên trong là trứng lòng đào, cắn vào có vị béo tràn ra, nếu không quen có thể nhờ quán làm trứng chín kỹ hơn. Có thể gọi thêm giò, măng ớt ngâm để tăng hương vị."
    },
    "1": {
      "cultureStory": "Cơm lam là cách nấu cơm truyền thống của người dân tộc thiểu số vùng núi phía Bắc, cho gạo nếp vào ống tre nứa tươi rồi nướng trên than hồng. Ống tre khi nướng sẽ tỏa ra hương thơm đặc biệt, cơm chín đều và có mùi thơm của tre. Thịt nướng thường dùng thịt lợn bản hoặc thịt lợn rừng, ướp với lá mắc mật - loại gia vị đặc trưng của vùng núi phía Bắc Việt Nam, nướng trên than cho đến khi bên ngoài giòn bên trong mềm. Sự kết hợp này thể hiện phong cách ẩm thực của cư dân vùng cao nguyên đá: nguyên liệu đơn giản, phương pháp nấu nướng gắn liền với môi trường tự nhiên.",
      "tastingTip": "Cơm lam bẻ ống tre ra ăn ngay, lớp cơm bên ngoài hơi cháy vàng có hương tre, bên trong dẻo mềm. Thịt nướng cắt miếng, ăn kèm rau rừng địa phương hoặc chấm muối ớt. Nếu ăn tại nhà hàng ven sông Nho Quế, thường được bày trên mẹt tre lót lá chuối, giá mâm từ 400.000–2.000.000 đồng, phù hợp nhóm 2–10 người. 🥞 Bánh tam giác mạch"
    },
    "2": {
      "cultureStory": "Bánh tam giác mạch được làm từ hạt của hoa tam giác mạch - loài hoa biểu tượng của Hà Giang. Người Mông trồng tam giác mạch vừa để ngắm hoa vừa để lấy hạt làm lương thực. Mùa hoa nở rộ từ tháng 10 đến tháng 12 cũng là mùa bánh tam giác mạch xuất hiện nhiều nhất, gắn liền với mùa du lịch cao điểm của Hà Giang. Hạt tam giác mạch sau khi xay thành bột có màu tím nhạt, nặn thành bánh dẹt hình tròn, hấp hoặc nướng chín, vị bùi ngọt nhẹ, là món quà vặt mộc mạc nhưng mang đậm ký ức vùng cao.",
      "tastingTip": "Bánh tươi ăn ngon nhất trong ngày, bánh nướng bên ngoài hơi giòn, bên trong mềm xốp, vị bùi. Có thể chấm mật ong hoặc ăn kèm đồ nướng. Nếu mua làm quà, bánh tươi không để được lâu, nên chọn loại đóng gói có hạn sử dụng rõ ràng, hoặc mua bột tam giác mạch về tự làm."
    },
    "3": {
      "cultureStory": "Cháo ấu tẩu được gọi là \"cháo độc dược\", vì nguyên liệu chính củ ấu tẩu chứa aconitin, ăn sống có thể gây tử vong. Nhưng người Mông Hà Giang qua nhiều thế hệ đã nắm vững kỹ thuật chế biến: ngâm củ ấu tẩu trong nước vo gạo một đêm, sau đó ninh nhiều giờ cho đến khi độc tố phân hủy hoàn toàn, củ mềm nhừ, mới nấu với gạo nếp, xương ống, móng giò thành cháo. Người dân địa phương tin rằng cháo ấu tẩu có tác dụng bồi bổ cơ thể, giảm mệt mỏi, hỗ trợ giấc ngủ, nên thường bán vào ban đêm, như một món ăn đêm bổ dưỡng.",
      "tastingTip": "Cháo có màu nâu sẫm, miếng đầu tiên có vị đắng nhẹ, sau đó là vị ngọt bùi, béo. Thường ăn kèm móng giò, thịt băm, có thể thêm trứng gà hoặc trứng vịt lộn, rắc tía tô, rau mùi, tiêu. Lưu ý an toàn: du khách không nên tự chế biến củ ấu tẩu, nhất định phải thưởng thức tại quán có kinh nghiệm địa phương."
    }
  },
  "langson": {
    "0": {
      "cultureStory": "Nguồn gốc của phở chua không có kết luận thống nhất, có người nói bắt nguồn từ Trung Quốc, cũng có người nói là biến thể của phở Hà Nội. Điểm đặc biệt cốt lõi của nó là hoàn toàn không có nước dùng nóng, thay vào đó là loại sốt đặc sệt màu nâu, kết hợp vị chua, cay, mặn, ngọt, trộn theo kiểu salad. Nước sốt thường dùng mỡ từ bụng vịt quay hoặc nước luộc vịt làm nền, thêm hành phi, tỏi, nước mắm, giấm, đường, gừng, cuối cùng cho bột năng để tạo độ sệt, công thức của mỗi quán là bí quyết riêng. Nguyên liệu bao gồm bánh phở, khoai lang chiên giòn, gan chiên, xá xíu thái lát, lạp xưởng, đậu phụ nhũ, đậu phộng, dưa chuột, rau thơm và vịt quay - đặc sản nổi tiếng của Lạng Sơn.",
      "tastingTip": "Khi ăn trộn đều tất cả nguyên liệu, để mỗi sợi phở đều được phủ một lớp sốt. Có thể thêm vài lát ớt, măng chua hoặc nước chanh để tăng hương vị. Mặc dù không có nước dùng nóng, nhưng bánh phở được chần qua nước nóng, sốt cũng được phục vụ nóng, nên vẫn phù hợp để ăn vào mùa đông."
    },
    "1": {
      "cultureStory": "Lá mắc mật là loại gia vị đặc trưng của vùng núi phía Bắc Việt Nam, hương thơm vừa ngọt vừa hăng nhẹ. Vịt quay Lạng Sơn thường chọn vịt nặng 1,8–2,2kg, nhồi lá mắc mật tươi và khô băm nhuyễn cùng hành tím, tỏi, gừng, hạt tiêu, muối, đường vào bụng vịt, bên ngoài phết mật ong và nước tương, quay cho đến khi da có màu vàng cánh gián.",
      "tastingTip": "Da giòn, thịt mềm. Nước chấm chuẩn vị nhất là nước tương thêm đường, tỏi băm, ớt tươi, chanh, một số nơi thêm nước tiết vịt hoặc dầu mè để tăng hương thơm. Có thể ăn kèm bánh mì, bún hoặc cơm trắng, thêm dưa chua để giảm ngấy."
    },
    "2": {
      "cultureStory": "Bánh áp chao được cho là có nguồn gốc từ Trung Quốc, sau khi du nhập vào Việt Nam được người Tày, Nùng địa phương cải biến thành món ăn vặt đặc sắc. Cách giải thích tên gọi có hai thuyết: một là theo cách làm của người Tày, Nùng \"nặn rồi đem chao (chiên)\", hai là phiên âm của \"vịt chao\". Vỏ bánh làm từ bột gạo nếp và gạo tẻ, trộn thêm đậu tương và khoai môn bào để tăng hương thơm và độ mềm, nhân là thịt ức vịt ướp gia vị. Bánh áp chao được bán quanh năm nhưng đông khách nhất vào cuối thu đầu đông (tháng 11 đến tháng 2 năm sau), người địa phương cho rằng món chiên nóng này giúp làm ấm cơ thể trong mùa đông lạnh giá.",
      "tastingTip": "Vớt ra ngay khi chiên xong, cắt miếng chấm với nước mắm chua ngọt, ăn kèm đu đủ xanh bào sợi, rau thơm và ớt tiêu cay để giảm ngấy. Vỏ bánh giòn, bên trong mềm dẻo, nhân thịt vịt đậm đà. Có thực khách phản ánh ăn đến chiếc thứ ba sẽ hơi ngấy."
    },
    "3": {
      "cultureStory": "Khâu nhục du nhập từ Trung Quốc (theo một số nguồn là từ Quảng Đông), sau đó được người Tày, Nùng Lạng Sơn Việt hóa và phát triển, trở thành món ăn quan trọng trong các dịp lễ tết, tiệc cưới, cỗ bàn. Nguyên liệu chính là thịt ba chỉ, qua các công đoạn luộc, châm da, chiên, hấp, cuối cùng đạt được hiệu quả \"tan trong miệng\". Thời gian hấp có thể lên đến 3–4 giờ.",
      "tastingTip": "Thịt mềm nhừ, béo ngậy nhưng không ngấy, thường ăn kèm rau cải luộc hoặc xôi nếp, cân bằng vị béo. Hương vị đậm đà, có hương thơm của tương đậu và các loại gia vị."
    }
  },
  "phutho": {
    "0": {
      "tastingTip": "Thưởng thức khi còn nóng, thịt gà chấm với muối tiêu chanh hoặc nước mắm gừng. Có thể gọi thêm quẩy, chấm vào nước dùng để tận hưởng trọn vẹn. 🍙 Cơm nắm lá cọ",
      "address": "Phở Gà Ngọc Minh: Ngõ 22 đường Nguyễn Du, Nông Trang, TP Việt Trì"
    },
    "1": {
      "tastingTip": "Bẻ đôi nắm cơm, chấm với muối vừng hoặc muối sả. Cơm dẻo chắc, vị thanh của lá cọ hòa quyện với vị bùi của muối vừng, càng nhai càng thơm.",
      "address": "Quán Nhím Nhím: 1951 Đại lộ Hùng Vương"
    },
    "2": {
      "tastingTip": "Thưởng thức khi còn nóng, chấm với nước mắm chua ngọt (nước mắm, đường, ớt, tỏi, chanh). Có thể ăn kèm cháo trắng, đây là cách ăn truyền thống của người dân địa phương.",
      "address": "Khu vực Phong Châu (huyện Phù Ninh)"
    },
    "3": {
      "tastingTip": "Cá lăng nướng riềng mẻ là món đặc trưng, vị chua của mẻ và hương thơm của riềng khử mùi tanh, làm nổi bật vị ngọt của cá. Lẩu cá lăng phù hợp nhóm đông người, nước dùng chua cay. Giá tham khảo 150.000–300.000 đồng/món.",
      "address": "Nhà hàng Cá Lăng Sông Đà Việt Trì: Khu Happy Land, phường Gia Cẩm, TP Việt Trì"
    }
  },
  "quangninh": {
    "0": {
      "cultureStory": "Linh hồn của bún hải sản Quảng Ninh nằm ở nước dùng trong, ngọt thanh, được ninh từ xương và hải sản tươi, không giống bún cá hay bún riêu ở nơi khác. Cù kỳ là loại cua biển đặc trưng của vùng biển Quảng Ninh, thịt chắc, gạch béo, là nguyên liệu quan trọng để phân biệt bún hải sản Hạ Long với các nơi khác.",
      "tastingTip": "Thưởng thức khi nóng, vắt thêm chanh, thêm ớt, ăn kèm rau sống. Nếu gọi bát đặc biệt, nên hỏi rõ giá trước để tránh phát sinh."
    },
    "1": {
      "cultureStory": "Xôi trắng chả mực là món ăn sáng \"thuần Quảng Ninh\" nhất. Chả mực phải dùng mực nang đánh bắt tại vùng biển Quảng Ninh, giã tay trong cối đá để giữ độ dai giòn, sau đó nặn dẹt chiên vàng. Xôi dùng gạo nếp cái hoa vàng, đồ bằng chõ gỗ, hạt dẻo thơm. Sự kết hợp này phản ánh đặc trưng ẩm thực của cư dân ven biển: tận dụng nguyên liệu biển tươi kết hợp với lương thực địa phương.",
      "tastingTip": "Xôi và chả mực ăn nóng, chấm nước mắm pha chua ngọt, ăn kèm dưa góp hoặc dưa chuột muối để cân bằng vị béo. 🥣 Sữa chua trân châu"
    },
    "2": {
      "cultureStory": "Sữa chua Cô Cương là ký ức tuổi thơ của nhiều người dân Hạ Long. Sữa chua làm thủ công tại nhà, không dùng hương liệu công nghiệp, vị chua nhẹ, ngọt thanh. Trân châu nấu chín tới, dai mềm, có mùi thơm của mè và dừa. Quán nằm trong ngõ nhỏ, không biển hiệu rầm rộ, hoàn toàn dựa vào truyền miệng của người dân địa phương.",
      "tastingTip": "Trân châu và sữa chua để riêng, khi ăn mới trộn đều, để cảm nhận được độ nóng lạnh và kết cấu của từng phần. Quán mở cửa từ chiều đến 23 giờ, phù hợp ăn vặt buổi tối."
    },
    "3": {
      "cultureStory": "Cù kỳ là loại cua biển đặc trưng của Quảng Ninh, thịt chắc, gạch thơm, là \"linh hồn\" của bún cù kỳ. Ngán biển ít được nhắc đến trên mạng, nhưng là hải sản địa phương mà người dân Quảng Ninh quen thuộc, thường xuất hiện trong bữa cơm gia đình.",
      "tastingTip": "Thịt cù kỳ có thể chấm nước mắm gừng hoặc nước chấm chua ngọt, gạch cù kỳ xào lên ăn kèm bún đặc biệt thơm. Ngán biển nếu gặp được, thường được nấu canh hoặc hấp, hương vị tươi ngọt."
    }
  },
  "thainguyen": {
    "0": {
      "cultureStory": "Bánh cuốn Thái Nguyên chịu ảnh hưởng từ cách làm bánh cuốn miền xuôi, nhưng điểm khác biệt nằm ở nước chấm. Một số quán sử dụng nước canh xương thay vì nước mắm chua ngọt thông thường, tương tự như cách ăn bánh cuốn ở các tỉnh vùng cao phía Bắc, phản ánh sự giao thoa ẩm thực giữa vùng trung du và miền núi.",
      "tastingTip": "Thưởng thức khi còn nóng, bánh cuốn mềm mịn, chan nước canh xương nóng hổi, có thể thêm hành phi, rau mùi. Nếu thích ăn cay, có thể thêm tương ớt địa phương.",
      "address": "Bánh cuốn Dung: Bắc Lô 2, Sơn, thành phố Thái Nguyên"
    },
    "1": {
      "cultureStory": "Cơm lam Định Hóa gắn liền với lịch sử căn cứ địa cách mạng (ATK). Trong thời kỳ kháng chiến chống Pháp, cơm lam của đồng bào địa phương từng là lương thực nuôi dưỡng cán bộ cách mạng. Người Tày gọi cơm lam là \"khẩu lảm\", dùng gạo nếp nương trồng trên ruộng bậc thang, cho vào ống nứa tươi nướng trên than hồng, cơm chín có mùi thơm của tre nứa. Cơm lam không chỉ là món ăn thường ngày mà còn xuất hiện trong lễ hội, cưới hỏi, cúng rừng, là một phần văn hóa ẩm thực của đồng bào vùng cao.",
      "tastingTip": "Bóc lớp vỏ nứa bên ngoài, cơm trắng ngần, dẻo mềm. Cách ăn truyền thống nhất là chấm muối vừng, hoặc ăn kèm thịt nướng. Cơm lam nên thưởng thức khi còn nóng để cảm nhận trọn vẹn hương thơm của tre nứa. 🍙 Bánh chưng Bờ Đậu",
      "address": "Quán Cơm Lam Tú Học nằm trên tuyến Bắc Kạn đi Thái Nguyên (Km13, cách đền thác Giềng 50m)"
    },
    "2": {
      "cultureStory": "Bánh chưng Bờ Đậu có lịch sử hơn 70 năm, nổi tiếng với hạt nếp dẻo thơm, đỗ xanh bùi mịn, thịt đậm đà. Điểm đặc biệt là bánh được luộc bằng nước suối từ núi đá phía sau làng (người dân gọi là \"nước giếng thần\"), giúp bánh giữ màu xanh tự nhiên và hương thơm đậm đà. Bánh được gói hoàn toàn bằng tay, giữ hình vuông vức, không bị méo khi luộc.",
      "tastingTip": "Bánh chưng Bờ Đậu thường được cắt thành miếng, ăn kèm dưa hành hoặc chấm nước mắm. Có thể rán qua chảo dầu để lớp vỏ giòn, thơm hơn. Bánh có kích thước khá lớn (một chiếc khoảng 1,2kg), phù hợp để chia sẻ trong gia đình hoặc làm quà biếu.",
      "address": "Bánh chưng Bờ Đậu có nguồn gốc từ làng Bờ Đậu, xã Vô Tranh, Thái Nguyên, làng nghề giữ nghề hơn 70 năm"
    },
    "3": {
      "cultureStory": "Trà Tân Cương được gọi là \"đệ nhất danh trà\" của Thái Nguyên. Giống chè được ông Tuần phủ Nguyễn Đình Tuân và ông Đội Năm (Vũ Văn Hiệt) mang từ Phú Thọ về Tân Cương vào khoảng năm 1925–1926, từ đó bén rễ và phát triển thành vùng chè đặc sản. Năm 2023, kỹ thuật canh tác và chế biến trà Tân Cương được công nhận là di sản văn hóa phi vật thể quốc gia. Vị trà Tân Cương đặc trưng: chát dịu nơi đầu lưỡi, sau đó chuyển thành hậu ngọt sâu, lưu lại lâu trong khoang miệng.",
      "tastingTip": "Thưởng trà không cần cầu kỳ. Pha trà bằng nước nóng khoảng 80–90°C, rót ra chén nhỏ, nâng chén bằng hai tay, ngắm màu nước xanh vàng trong vắt, nhấp từng ngụm nhỏ để cảm nhận vị chát dịu và hậu ngọt. Người Tân Cương cho rằng thưởng trà là cảm nhận đất trời, thời tiết và công sức người làm trà gửi gắm trong từng búp chè.",
      "address": "Hợp tác xã Chè Hảo Đạt: Xã Tân Cương, thành phố Thái Nguyên"
    }
  },
  "tuyenquang": {
    "0": {
      "cultureStory": "Trong kết quả tìm kiếm không có giải thích cụ thể về văn hóa phở bò Tuyên Quang. Từ đánh giá của thực khách có thể thấy, phở nơi đây theo đuổi phong cách \"cổ điển, truyền thống\": nước dùng ninh xương, nấu bằng bếp củi, không dùng mì chính, sợi phở mềm. Điều này phản ánh sự kế thừa và bảo tồn ẩm thực phở miền Bắc tại Tuyên Quang.",
      "tastingTip": "Thưởng thức khi còn nóng, trước tiên nếm thử một thìa nước dùng nguyên vị để cảm nhận vị ngọt thanh của xương hầm. Thịt bò thái mỏng, có thể chấm với nước mắm hoặc tương ớt. Nếu thích ăn cay, có thể thêm ớt tươi và hạt tiêu.",
      "address": "Phở Có: Số 104 đường Chiến Thắng Sông Lô, Tổ 4, Minh Xuân, thành phố Tuyên Quang"
    },
    "1": {
      "cultureStory": "Kết quả tìm kiếm không có câu chuyện văn hóa cụ thể về lợn đen Tuyên Quang. Từ thông tin nhà hàng có thể thấy, lợn đen bản địa được mô tả là \"thịt chắc, ngọt, thơm\", đây là đặc điểm chung của giống lợn đen vùng núi phía Bắc Việt Nam, thường được chăn thả tự nhiên, cho ăn rau xanh và ngũ cốc.",
      "tastingTip": "Lợn đen luộc nên chọn thịt ba chỉ hoặc thịt vai, luộc chín tới để giữ vị tươi ngon. Chấm với muối mắc khén hoặc nước mắm gừng, càng làm nổi bật vị ngọt tự nhiên của thịt. Có thể ăn kèm rau rừng luộc hoặc xôi nếp để cân bằng vị béo.",
      "address": "Nhà hàng Sơn Vân: Tổ 2 thị trấn Mèo Vạc, huyện Mèo Vạc, tỉnh Tuyên Quang"
    },
    "2": {
      "cultureStory": "Bánh trứng kiến là món ăn truyền thống của người Tày, nhân làm từ trứng kiến đen rừng. Người Tày gọi là \"tua rày\", trứng kiến chỉ có vào tháng 3–4 âm lịch, mang tính thời vụ rất mạnh. Theo nghiên cứu, trứng kiến đen chứa 42–47% protein và hơn 31 loại vi chất dinh dưỡng. Người dân địa phương cho rằng đây là món ăn bổ dưỡng, cũng là \"đặc sản quý\" để chiêu đãi khách.",
      "tastingTip": "Vỏ bánh làm từ bột nếp nương, nhân là trứng kiến xào với hành phi, thì là và một chút muối. Bánh được gói bằng lá vả, hấp khoảng 40–45 phút. Ngon nhất khi ăn nóng, mở lá ra, hương thơm của nếp nương và lá vả hòa quyện, cắn một miếng cảm nhận được vị dẻo của vỏ bánh và vị béo bùi của trứng kiến, hoàn toàn không có mùi tanh. Lưu ý: lần đầu ăn nên thử một miếng nhỏ trước, xem có dị ứng với trứng kiến không.",
      "address": "Chợ Đồng Tâm: Có người dùng mạng chia sẻ đã mua tại đây, hộp nhỏ 50.000 đồng"
    },
    "3": {
      "cultureStory": "Cá bỗng là \"cá tiến vua\" quý hiếm, thường dành cho lễ Tết và khách quý của người Tày. Điểm độc đáo: dùng xương cá rang xay thay thính gạo, nước chấm \"chẻo\" nấu từ xương cá và mẻ.",
      "tastingTip": "Cá thái mỏng lăn bột xương và lạc rang. Dùng lá sung cuốn cùng rau rừng, chuối xanh, khế chua, rưới nước chẻo, cuộn chặt tay. Vị chát lá rừng → ngọt cá → bùi xương rang → béo đậm nước chẻo.",
      "address": "Nhà hàng Dũng Cá Sông Lô: Tổ 2, TP Tuyên Quang"
    }
  },
  "dienbien": {
    "0": {
      "cultureStory": "Xôi chim kết hợp gạo nếp nương thơm dẻo với thịt chim bồ câu, thể hiện nét ẩm thực vùng cao Tây Bắc, nơi những nguyên liệu địa phương được kết hợp thành món ăn giàu hương vị. Xôi nếp nương cũng là một đặc sản tiêu biểu của Điện Biên.",
      "tastingTip": "Nên ăn khi xôi còn nóng để cảm nhận độ dẻo thơm của nếp và vị béo ngậy của thịt chim. Hỏi quán về cách sơ chế thịt chim nếu bạn không thích phần xương băm nhỏ.",
      "address": "Quán Cơm – Xôi Kim Sinh, số 3 đường 7 Tháng 5, phường Mường Thanh, Điện Biên Phủ. Giá dự kiến: 45.000đ/suất"
    },
    "1": {
      "cultureStory": "Lợn bản gắn với đời sống chăn nuôi của đồng bào vùng núi. Thịt thường được chế biến bằng những phương pháp dân dã như nướng, hấp hoặc quay, tạo nên hương vị gần gũi với nguyên liệu tự nhiên và văn hóa ẩm thực cộng đồng.",
      "tastingTip": "Nên ăn khi thịt còn nóng, kết hợp rau thơm và gia vị chấm của quán. Hãy hỏi rõ cách chế biến vì “thui mộc” có thể được mỗi cơ sở thực hiện khác nhau.",
      "address": "Cửa hàng Điện Biên Food, số 679 đường Võ Nguyên Giáp, TP. Điện Biên Phủ"
    },
    "2": {
      "cultureStory": "Khẩu xén là loại bánh truyền thống gắn với người Thái ở khu vực Mường Lay, Điện Biên. Bánh được làm từ sắn hoặc gạo, tạo hình thành miếng nhỏ rồi phơi khô; khi chiên, bánh nở phồng, giòn và thơm. Món bánh còn được dùng để tiếp khách và làm quà trong dịp Tết.",
      "tastingTip": "Chọn bánh vừa chiên xong để cảm nhận độ giòn xốp. Có thể thử cả loại làm từ sắn và loại làm từ gạo nếp để so sánh hương vị.",
      "address": "Nhà hàng Gà Tây Bắc số 82 Nguyễn Hữu Thọ, phường Mường Thanh, TP. Điện Biên Phủ, tỉnh Điện Biên"
    }
  },
  "hoabinh": {
    "1": {
      "cultureStory": "Lợn thui luộc là món ăn tiêu biểu trong các bữa ăn mang phong cách người Mường ở Hòa Bình. Lợn được thui để tạo lớp da vàng thơm, sau đó làm sạch, luộc chín và thái thành từng miếng. Món ăn thể hiện cách tận dụng nguyên liệu địa phương và thường xuất hiện trong những mâm cơm đãi khách.",
      "tastingTip": "Cuốn thịt cùng các loại lá rừng ăn được do nhà hàng cung cấp, sau đó chấm muối rang hoặc gia vị hạt dổi. Nên thử thịt cùng một loại lá trước để cảm nhận vị ngọt của thịt, độ thơm của lớp da thui và hương vị riêng của từng loại lá.",
      "address": "23 Đà Giang, khu vực trung tâm Hòa Bình, tỉnh Phú Thọ"
    },
    "2": {
      "cultureStory": "Chả cuốn lá bưởi là món ăn mang dấu ấn ẩm thực người Mường ở Hòa Bình. Thịt lợn, thường là thịt ba chỉ hoặc thịt lợn bản, được thái miếng, tẩm gia vị rồi cuốn trong lá bưởi và nướng trên than hồng. Điểm đặc biệt nằm ở sự kết hợp giữa vị ngọt của thịt và tinh dầu thơm, hơi cay nồng của lá bưởi.",
      "tastingTip": "Nên ăn ngay khi chả vừa nướng xong để cảm nhận rõ hương lá bưởi và vị ngọt của thịt. Chọn miếng chả chín đều, lá hơi xém thơm nhưng không cháy đen; ăn kèm rau thơm hoặc gia vị chấm của quán nếu có.",
      "address": "317 Đê Đà Giang, khu vực Hòa Bình"
    },
    "3": {
      "cultureStory": "Cơm lam gắn với văn hóa ẩm thực của nhiều cộng đồng miền núi, trong đó có người Mường ở Hòa Bình. Gạo nếp được cho vào ống tre hoặc nứa rồi nướng trên lửa, tạo độ dẻo và hương thơm đặc trưng. Thịt nướng xâu cũng gợi cách chế biến dân dã bên bếp lửa, nơi thịt được xiên thành từng xâu và nướng chín trên than. Sự kết hợp này mang đến trải nghiệm ẩm thực mộc mạc, gần gũi với nguyên liệu vùng núi.",
      "tastingTip": "Bóc nhẹ lớp vỏ ống cơm lam và ăn khi cơm còn ấm. Dùng thịt nướng xâu ngay khi còn nóng, kết hợp với muối vừng hoặc gia vị chấm địa phương nếu nhà hàng có phục vụ. Nên thử riêng cơm lam trước để cảm nhận vị ngọt của nếp, sau đó ăn cùng thịt nướng để cảm nhận sự hòa quyện giữa vị bùi và vị đậm đà.",
      "address": "Đường Lê Thánh Tông, khu vực Hòa Bình, tỉnh Phú Thọ"
    }
  },
  "laichau": {
    "1": {
      "cultureStory": "Pa Pỉnh Tộp là món ăn tiêu biểu của người Thái. Cá thường được mổ dọc lưng, nhồi hỗn hợp rau thơm, mắc khén, ớt và các loại gia vị, sau đó kẹp bằng thanh tre rồi nướng trên than. Cách chế biến này làm nổi bật hương thơm của gia vị núi rừng và vị ngọt tự nhiên của cá.",
      "tastingTip": "Gỡ thịt cá thành từng miếng nhỏ, ăn khi còn nóng và chấm chẩm chéo nếu được phục vụ. Nên thử một miếng cá trước khi chấm để cảm nhận vị thơm của mắc khén và độ ngọt tự nhiên của thịt cá.",
      "address": "139 đường 19/8, phường Đoàn Kết, TP. Lai Châu"
    },
    "2": {
      "cultureStory": "Lạp sườn gác bếp gắn với văn hóa bếp lửa của các cộng đồng vùng cao Tây Bắc, trong đó có người Thái. Thịt lợn được tẩm ướp gia vị, nhồi vào lòng rồi treo trên gác bếp để hong khói, giúp bảo quản thịt lâu hơn trong điều kiện sinh hoạt truyền thống. Mắc khén và các gia vị địa phương tạo nên hương vị đặc trưng.",
      "tastingTip": "Hấp hoặc nướng lại trước khi ăn để lạp sườn mềm và dậy mùi khói. Thái lát chéo mỏng, ăn cùng xôi nếp nương hoặc cơm nóng; có thể chấm chẩm chéo để tăng hương vị.",
      "address": "được công bố: số nhà 069 đường Tuệ Tĩnh, tổ 27, phường Đông Phong, TP. Lai Châu"
    },
    "3": {
      "cultureStory": "Cá lăng là loài cá nước ngọt được sử dụng trong nhiều món ăn Việt Nam. Lẩu cá lăng thể hiện cách thưởng thức cá cùng nước dùng, rau xanh và các nguyên liệu theo mùa trong bữa ăn gia đình hoặc nhóm bạn. Đây là món phù hợp để kết thúc ngày khám phá ẩm thực, nhưng không nên giới thiệu nó như món truyền thống riêng của Lai Châu nếu chưa có nguồn chứng minh.",
      "tastingTip": "Chờ nước lẩu sôi rồi mới cho cá vào, tránh nấu quá lâu khiến thịt cá bị nát. Thưởng thức cá cùng rau và bún, nếm nước dùng trước khi thêm gia vị để cảm nhận vị ngọt tự nhiên.",
      "address": "025 đường Bờ Hồ Thủy Sơn, phường Tân Phong, TP. Lai Châu"
    }
  },
  "laocai": {
    "0": {
      "cultureStory": "Phở chua Bắc Hà là món ăn đặc trưng của vùng cao Bắc Hà. Sợi phở thường được làm thủ công từ gạo địa phương, kết hợp với nước trộn có vị chua ngọt và các loại thịt, rau ăn kèm. Món ăn phản ánh sự sáng tạo trong cách chế biến nguyên liệu quen thuộc của cư dân vùng cao.",
      "tastingTip": "Trộn đều các nguyên liệu trước khi ăn để nước sốt thấm vào sợi phở. Nếm thử trước khi thêm ớt hoặc gia vị để cảm nhận vị chua ngọt đặc trưng.",
      "address": "Số 17 Na Lo, xã Bắc Hà, tỉnh Lào Cai"
    },
    "1": {
      "cultureStory": "Lợn cắp nách là tên gọi quen thuộc của giống lợn bản nhỏ được nuôi tại các vùng núi Tây Bắc. Thịt lợn thường được chế biến thành nhiều món như quay, nướng, hấp hoặc xào, trở thành một phần trong các mâm cơm đãi khách và bữa ăn cộng đồng.",
      "tastingTip": "Nên ăn khi thịt còn nóng để cảm nhận lớp bì giòn và phần thịt mềm. Kết hợp rau rừng, rau thơm và gia vị chấm của nhà hàng để cân bằng vị béo. 3. Hạt dẻ nướng",
      "address": "106 đường Thạch Sơn, Sa Pa, tỉnh Lào Cai"
    },
    "2": {
      "cultureStory": "Hạt dẻ rang là món ăn vặt quen thuộc tại các điểm du lịch vùng núi phía Bắc, đặc biệt vào những ngày trời lạnh. Hạt dẻ được rang nóng để làm dậy mùi thơm và vị bùi tự nhiên, thường được du khách mua thưởng thức tại chỗ hoặc mang về làm quà.",
      "tastingTip": "Nên chọn hạt dẻ vừa rang nóng, vỏ không bị cháy đen và phần nhân mềm bùi. Để nguội bớt trước khi bóc vỏ, tránh bỏng tay; có thể mua một phần nhỏ để ăn thử trước khi mua mang về.",
      "address": "Khu vực chợ Sa Pa, đường N2, Sa Pa, tỉnh Lào Cai"
    },
    "3": {
      "cultureStory": "Cá tầm được nuôi tại các vùng nước lạnh ở Sa Pa và trở thành nguyên liệu nổi bật trong ẩm thực du lịch địa phương. Món lẩu kết hợp cá tươi với rau xanh và nước dùng nóng, phù hợp với khí hậu mát lạnh vùng núi.",
      "tastingTip": "Nhúng cá vừa chín tới để giữ độ săn và ngọt. Thưởng thức cùng rau xanh, nấm và bún; nếm nước dùng trước khi thêm gia vị.",
      "address": "71 Xuân Viên, Sa Pa, tỉnh Lào Cai"
    }
  },
  "sonla": {
    "0": {
      "cultureStory": "Bún cá là món ăn quen thuộc ở nhiều vùng miền Việt Nam, với sự kết hợp giữa cá, bún gạo và nước dùng. Khi đưa vào tour Sơn La, món ăn có thể mở đầu ngày khám phá ẩm thực bằng một bữa sáng nhẹ nhàng. Tuy nhiên, chưa có căn cứ để khẳng định bún cá chép là đặc sản truyền thống riêng của Sơn La.",
      "tastingTip": "Nếm nước dùng trước khi thêm gia vị, ăn khi nóng và kết hợp rau thơm. Nếu dùng cá chiên, nên ăn sớm để cảm nhận lớp ngoài giòn và phần thịt cá mềm."
    },
    "1": {
      "cultureStory": "Nậm pịa là món ăn truyền thống của người Thái ở vùng Tây Bắc. Món được chế biến từ nội tạng động vật, kết hợp phần dịch tiêu hóa (pịa) cùng các loại rau thơm và gia vị địa phương. Đây là món ăn gắn với văn hóa ẩm thực bản địa và thường được xem là trải nghiệm dành cho những người muốn tìm hiểu sâu hơn về phong tục ăn uống của người Thái.",
      "tastingTip": "Nên thử một lượng nhỏ trước để làm quen với vị đắng và mùi gia vị đặc trưng. Có thể ăn kèm rau thơm, ớt hoặc các món nướng nếu nhà hàng phục vụ. Hãy hỏi nhân viên về thành phần và cách ăn truyền thống trước khi dùng.",
      "address": "Ngõ 04 Hoàng Quốc Việt, khu vực Tô Hiệu, TP. Sơn La"
    },
    "2": {
      "cultureStory": "Thịt trâu gác bếp là đặc sản nổi tiếng của nhiều cộng đồng Tây Bắc, trong đó có người Thái. Thịt được thái dọc thớ, tẩm ướp gia vị như mắc khén, gừng và ớt, sau đó hong khói trên gác bếp. Phương pháp này giúp bảo quản thịt và tạo nên mùi khói đặc trưng.",
      "tastingTip": "; Làm nóng thịt bằng cách hấp hoặc nướng nhẹ, sau đó đập mềm và xé dọc thớ. Chấm chẩm chéo để cảm nhận vị cay thơm của gia vị. Nếu thịt quá khô, không nên nướng trực tiếp quá lâu vì dễ làm thịt dai hơn."
    },
    "3": {
      "cultureStory": "Bê chao là món ăn gắn liền với hình ảnh ẩm thực Mộc Châu, nơi có hoạt động chăn nuôi bò sữa và nguồn bê non. Thịt bê được thái miếng, tẩm ướp rồi chao nhanh trong dầu nóng để bên ngoài vàng thơm nhưng bên trong vẫn mềm ngọt. Món ăn trở thành một trong những trải nghiệm ẩm thực nổi bật của du khách khi đến cao nguyên Mộc Châu.",
      "tastingTip": "Ăn ngay khi bê vừa được mang ra để giữ độ nóng và lớp ngoài giòn nhẹ. Chấm với nước tương hoặc nước chấm riêng của quán, kết hợp lá chanh và rau ăn kèm để cân bằng vị béo.",
      "address": "Tiểu khu 3, đường Lê Thanh Nghị, thị trấn Mộc Châu, Sơn La"
    }
  },
  "yenbai": {
    "0": {
      "cultureStory": "Phở là món ăn quen thuộc của người Việt, kết hợp bánh phở, nước dùng và thịt. Khi dùng vịt nướng làm nguyên liệu chính, món ăn có thêm mùi thơm của thịt nướng, vị béo của da vịt và vị đậm đà của nước dùng. Tuy nhiên, chưa có căn cứ để xem phở vịt nướng là đặc sản riêng của Yên Bái.",
      "tastingTip": "Nếm nước dùng trước khi thêm gia vị, ăn thịt vịt khi còn nóng và kết hợp rau thơm để cân bằng vị béo.",
      "address": "Quán Phở Thủy Điệp 103 Đinh Tiên Hoàng, khu vực TP. Yên Bái cũ"
    },
    "1": {
      "cultureStory": "Muồm muỗm rang là món ăn đặc trưng được nhắc đến trong văn hóa ẩm thực Mường Lò. Món ăn gắn với đời sống nông nghiệp và mùa vụ ở vùng trồng lúa. Muồm muỗm sau khi sơ chế thường được om cùng gia vị rồi rang giòn, tạo nên hương vị béo bùi và mùi thơm của lá chanh.",
      "tastingTip": "Nên ăn khi còn nóng để cảm nhận độ giòn và hương thơm của lá chanh. Nếu lần đầu thưởng thức côn trùng, hãy thử một lượng nhỏ trước.",
      "address": "Nhà Sàn Gái Bản"
    },
    "2": {
      "cultureStory": "Bánh chưng đen là món bánh truyền thống của người Thái ở Mường Lò, thường xuất hiện trong dịp lễ Tết và trên mâm cúng tổ tiên. Bánh được làm từ gạo nếp, nhân đỗ xanh và thịt lợn; màu đen đặc trưng có thể được tạo từ nguyên liệu thực vật như thân cây núc nác hoặc hoa vừng đen được chế biến theo cách truyền thống.",
      "tastingTip": "Cắt bánh thành lát vừa ăn và hấp nóng nếu bánh đã nguội. Thưởng thức cùng trà nóng để cảm nhận vị dẻo thơm của nếp, vị bùi của đỗ và vị béo của thịt.",
      "address": "mua: Chợ Mường Lò Khu vực trung tâm Nghĩa Lộ, Yên Bái cũ"
    },
    "3": {
      "cultureStory": "Nếp Tú Lệ, còn được gọi là nếp Tan Lả, nổi tiếng nhờ hạt gạo thơm và độ dẻo đặc trưng. Loại nếp này gắn với hoạt động trồng lúa và văn hóa ẩm thực của người Thái tại thung lũng Tú Lệ; ngoài đồ xôi, nếp còn được dùng để làm cốm và các món bánh truyền thống.",
      "tastingTip": "Ăn xôi khi còn ấm để cảm nhận rõ độ dẻo và hương thơm tự nhiên. Có thể dùng kèm muối vừng hoặc món mặn địa phương nếu muốn biến món xôi thành một phần bữa tối.",
      "address": "Nhà hàng Phố Núi Quốc lộ 32, xã Tú Lệ, khu vực Văn Chấn, Yên Bái cũ"
    }
  },
  "thanhhoa": {
    "0": {
      "cultureStory": "Bánh cuốn là món ăn quen thuộc trong đời sống người dân xứ Thanh. Bánh được tráng từ bột gạo, cuốn nhân thịt băm và mộc nhĩ, ăn cùng nước mắm pha và hành phi. Nét hấp dẫn nằm ở lớp bánh mềm, nóng và cách pha nước chấm theo khẩu vị địa phương.",
      "tastingTip": "Nên ăn ngay khi bánh vừa tráng xong, thêm hành phi và chả nếu quán có phục vụ. Nếm nước chấm trước khi thêm ớt để cảm nhận vị chua, ngọt và mặn hài hòa.",
      "address": "06 Thọ Hạc, phường Hạc Thành, Thanh Hóa"
    },
    "1": {
      "cultureStory": "Gỏi cá nhệch gắn với đời sống cư dân vùng cửa sông và ven biển Nga Sơn. Cá nhệch được làm sạch, lọc thịt, thái lát rồi trộn thính gạo. Điểm đặc sắc là nước chẻo chế biến từ xương cá cùng riềng, sả, mẻ và gia vị, ăn kèm nhiều loại lá và rau thơm. Món ăn thể hiện sự cầu kỳ và kinh nghiệm chế biến thủy sản của người dân địa phương.",
      "tastingTip": "Cuốn gỏi cùng lá sung hoặc lá ổi, thêm rau thơm và chấm chẻo theo hướng dẫn của nhà hàng. Đây là món cá sống hoặc tái, vì vậy nên chọn cơ sở uy tín, bảo đảm vệ sinh; người mang thai, trẻ nhỏ và người có nguy cơ cao với bệnh do thực phẩm nên tránh ăn cá sống.",
      "address": "Khu vực Nga Liên – Hồ Vương, Nga Sơn, Thanh Hóa. Điện thoại: 0237 3650 999"
    },
    "2": {
      "cultureStory": "Nem chua là một trong những đặc sản nổi tiếng nhất của Thanh Hóa, thường được mua để thưởng thức hoặc làm quà. Nem được làm từ thịt lợn, bì thái sợi, thính và gia vị; quá trình lên men tạo nên vị chua dịu đặc trưng. Lá gói, tỏi, ớt và lá đinh lăng góp phần tạo mùi vị riêng của nem chua xứ Thanh.",
      "tastingTip": "Có thể ăn cùng tỏi, ớt hoặc lá đinh lăng nếu được gói kèm. Vì nem là thực phẩm lên men, cần chú ý hạn dùng, điều kiện bảo quản và chọn sản phẩm có nguồn gốc rõ ràng.",
      "address": "78 Lê Quý Đôn, phường Hạc Thành, Thanh Hóa. Điện thoại: 0326 666 219"
    },
    "3": {
      "cultureStory": "Chả tôm là món ăn đặc trưng của thành phố Thanh Hóa. Nhân tôm được giã hoặc xay nhuyễn, nêm gia vị, cuốn trong bánh phở hoặc lớp bánh mỏng rồi nướng trên than. Khi chín, chả có mùi thơm của tôm và lớp ngoài vàng nhẹ. Món ăn thường được dùng cùng rau sống, đồ chua và nước chấm.",
      "tastingTip": "Ăn lúc chả còn nóng để cảm nhận rõ mùi thơm của tôm nướng. Cuốn cùng rau sống, thêm đồ chua và chấm nước mắm chua ngọt để giảm cảm giác béo.",
      "address": "14 Nhà Thờ, phường Hạc Thành, Thanh Hóa. Điện thoại: 0975 693 904"
    }
  },
  "nghean": {
    "0": {
      "cultureStory": "Súp lươn là món ăn tiêu biểu của ẩm thực xứ Nghệ. Lươn được sơ chế kỹ, nấu cùng nghệ, hành tăm và các gia vị tạo nên nước súp vàng óng, đậm đà, thường có vị cay đặc trưng. Ăn cùng bánh mì là cách thưởng thức phổ biến, giúp thực khách tận dụng phần nước súp thơm ngon.",
      "tastingTip": "Xé bánh mì thành miếng nhỏ để chấm vào súp khi còn nóng. Nếm trước để điều chỉnh độ cay theo khẩu vị.",
      "address": "52 Nguyễn Chích, khu vực TP. Vinh, Nghệ An"
    },
    "1": {
      "cultureStory": "Mực nháy, còn được gọi là mực nhảy, gắn với nghề khai thác hải sản và văn hóa ẩm thực biển Cửa Lò. Mực vừa đánh bắt có thân trong, ánh sáng phản chiếu lấp lánh. Người dân thường chế biến bằng cách nướng hoặc hấp để giữ vị ngọt tự nhiên và độ giòn của thịt mực.",
      "tastingTip": "Ưu tiên hấp hoặc nướng đơn giản, chấm muối tiêu chanh để cảm nhận vị ngọt của mực. Hỏi giá theo cân và tổng trọng lượng trước khi chế biến để tránh phát sinh chi phí ngoài dự kiến.",
      "address": "308 Bình Minh, Cửa Lò, Nghệ An"
    },
    "2": {
      "cultureStory": "Ở Nghệ An, món bánh tương tự bánh ướt thường được gọi là bánh mướt. Bánh làm từ bột gạo, tráng thành lớp mỏng, mềm và trắng. Người dân thường ăn kèm giò chả, hành phi, nước mắm hoặc các món xáo. Sự giản dị của bánh mướt phản ánh nét ẩm thực gần gũi, coi trọng nguyên liệu quen thuộc của người dân xứ Nghệ.",
      "tastingTip": "Ăn khi bánh còn ấm, cuốn cùng giò chả hoặc chấm nước mắm pha. Nếu muốn trải nghiệm theo cách địa phương, có thể hỏi quán về món bánh mướt ăn cùng súp lươn.",
      "address": "12 Lê Mao, khu vực TP. Vinh, Nghệ An"
    },
    "3": {
      "cultureStory": "Gà nướng là món ăn phổ biến trong các bữa ăn gia đình và những buổi tụ họp. Tùy cách chế biến, gà có thể được tẩm ướp với sả, riềng, mắc khén hoặc các loại gia vị địa phương rồi nướng đến khi da vàng thơm, thịt chín mềm. Nếu bạn đang nhắc đến một món gà nướng đặc trưng riêng của Nghệ An, cần xác định đúng tên trước khi viết câu chuyện văn hóa.",
      "tastingTip": "Ăn gà khi còn nóng, kết hợp rau sống và nước chấm của quán. Nên hỏi rõ phần ăn gồm những gì và giá tính theo suất hay theo con.",
      "address": "18 Phong Định Cảng, khu vực TP. Vinh, Nghệ An"
    }
  },
  "hatinh": {
    "0": {
      "cultureStory": "Cháo canh là món ăn quen thuộc trong đời sống người dân Hà Tĩnh, đặc biệt phổ biến vào bữa sáng. Sợi bánh thường làm từ bột mì, có độ mềm dai, kết hợp với nước dùng ninh xương và các loại nhân như tôm, thịt hoặc giò. Hương vị đậm đà, cách chế biến gần gũi khiến món ăn trở thành một nét đặc trưng trong văn hóa ẩm thực xứ Nghệ.",
      "tastingTip": "Nên ăn khi còn nóng, nếm nước dùng trước khi thêm gia vị để cảm nhận vị ngọt tự nhiên và độ dai mềm của sợi bánh; có thể thêm tiêu hoặc ớt tùy khẩu vị."
    },
    "1": {
      "cultureStory": "Mực nhảy là đặc sản nổi tiếng của vùng biển Hà Tĩnh, đặc biệt gắn với khu vực Vũng Áng. Tên gọi xuất phát từ hình ảnh những con mực còn sống, thân trong và ánh lên khi di chuyển. Món ăn phản ánh kinh nghiệm đánh bắt, bảo quản và chế biến hải sản của cư dân ven biển, đồng thời trở thành một trải nghiệm ẩm thực hấp dẫn đối với du khách.",
      "tastingTip": "Ưu tiên mực hấp hoặc nướng đơn giản để giữ vị ngọt tự nhiên, chấm cùng muối tiêu chanh và hỏi rõ giá theo kilogram trước khi gọi món."
    },
    "2": {
      "cultureStory": "Kẹo cu đơ là đặc sản nổi tiếng gắn liền với hình ảnh Hà Tĩnh, thường được du khách chọn mua làm quà. Kẹo được chế biến từ lạc rang, mật mía, gừng và bánh tráng, tạo nên sự kết hợp giữa vị ngọt, bùi, cay nhẹ và độ giòn. Món kẹo còn gắn với nét hiếu khách của người dân địa phương, thường được dùng để mời khách cùng thưởng thức chè xanh.",
      "tastingTip": "Bẻ kẹo thành miếng nhỏ, nhai chậm để cảm nhận vị giòn của bánh tráng, vị bùi của lạc và vị cay ấm của gừng; thưởng thức cùng chè xanh nóng để cân bằng vị ngọt."
    },
    "3": {
      "cultureStory": "Hến xào xúc bánh tráng là món ăn dân dã gắn với đời sống cư dân vùng sông nước miền Trung, trong đó có Hà Tĩnh. Hến được làm sạch rồi xào cùng hành, gia vị và rau thơm, tạo nên món ăn thơm bùi, đậm đà. Bánh tráng nướng được dùng để xúc hến, vừa tạo độ giòn vừa giúp món ăn trở nên tiện lợi và gần gũi. Cách chế biến giản dị này thể hiện nét ẩm thực coi trọng nguyên liệu địa phương của người dân miền Trung.",
      "tastingTip": "Nên ăn khi hến còn nóng, dùng bánh tráng vừa nướng để xúc nhằm giữ độ giòn và cảm nhận rõ hương thơm của hành, rau gia vị; tránh để bánh tiếp xúc lâu với hến nóng vì sẽ nhanh mềm."
    }
  },
  "quangbinh": {
    "0": {
      "cultureStory": "Cháo canh là món ăn dân dã gắn bó với nhiều thế hệ người dân Quảng Bình, thường được dùng vào bữa sáng. Sợi bánh làm từ bột gạo hoặc bột mì được nấu trong nước dùng đậm đà, kết hợp với cá lóc, thịt và chả. Điểm đặc trưng của món ăn là sự kết hợp giữa nguyên liệu bình dị và cách nêm nếm đậm vị miền Trung.",
      "tastingTip": "Nên ăn khi còn nóng, nếm nước dùng trước khi thêm tiêu hoặc ớt để cảm nhận vị ngọt của cá và độ dai mềm của sợi bánh; có thể gọi thêm ram giòn để ăn kèm.",
      "address": "Bánh Canh Cá Lóc Sương Hồng Ngõ 21 Quang Trung, Đồng Hới"
    },
    "1": {
      "cultureStory": "Gà nướng Phong Nha là món ăn được nhiều du khách yêu thích khi khám phá vùng núi đá vôi và hang động Quảng Bình. Gà thường được tẩm ướp gia vị địa phương rồi nướng trên than, tạo lớp da vàng thơm và phần thịt ngọt mềm. Món ăn thường được kết hợp với muối cheo, loại nước chấm có vị cay, mặn và hương thơm đặc trưng. Đây là một trải nghiệm ẩm thực gắn với phong cách ăn uống dân dã của vùng Phong Nha.",
      "tastingTip": "Nên ăn gà ngay khi vừa nướng xong, chấm cùng muối cheo để cảm nhận vị ngọt của thịt hòa với hương thơm cay mặn của gia vị.",
      "address": "East Hill Phong Nha Khu vực Phong Nha, huyện Bố Trạch trước đây"
    },
    "2": {
      "cultureStory": "Bánh lọc trần là món ăn quen thuộc trong văn hóa ăn quà của người dân Quảng Bình. Bánh được làm từ bột sắn, có lớp vỏ trong và dai, thường chứa nhân tôm hoặc thịt được nêm gia vị vừa phải. Khi ăn cùng nước mắm pha, món bánh mang đến sự kết hợp giữa độ dai của vỏ, vị đậm đà của nhân và vị mặn ngọt của nước chấm. Cách chế biến từ những nguyên liệu dân dã đã giúp bánh lọc trở thành món ăn được nhiều du khách tìm thưởng thức.",
      "tastingTip": "Nên ăn bánh khi còn nóng và chấm nước mắm pha vừa vị để cảm nhận độ dai của vỏ bánh cùng vị đậm đà của nhân tôm thịt.",
      "address": "12 Đông Hải, Đồng Hới"
    },
    "3": {
      "cultureStory": "Lẩu cá khoai là món ăn nổi bật trong ẩm thực biển Quảng Bình, thường được nhắc đến nhiều vào những tháng cuối năm. Cá khoai có thân mềm, thịt trắng và vị ngọt thanh, thích hợp nấu cùng nước lẩu chua nhẹ với cà chua và gia vị. Do thịt cá mềm và dễ nát, người nấu cần kiểm soát thời gian để giữ được hình dạng và vị ngon. Món lẩu nóng hổi thể hiện nét ẩm thực miền biển, ưu tiên nguyên liệu tươi và cách chế biến không quá cầu kỳ.",
      "tastingTip": "Cho cá vào nồi khi nước lẩu sôi nhẹ và nấu vừa chín tới để giữ thịt mềm ngọt, sau đó ăn cùng rau và nước lẩu chua thanh.",
      "address": "45 Trương Pháp, Đồng Hới"
    }
  },
  "quangtri": {
    "0": {
      "cultureStory": "Bún hến Mai Xá bắt nguồn từ nét ẩm thực dân dã của vùng sông nước Quảng Trị, nổi bật với nguyên liệu chắt chắt, một loài nhuyễn thể nhỏ sống ở vùng nước lợ. Người dân chế biến chắt chắt thành món bún đậm đà, kết hợp rau sống và gia vị địa phương. Từ món ăn quen thuộc trong đời sống thường ngày, bún hến đã trở thành một đặc sản được du khách tìm thưởng thức khi đến Quảng Trị.",
      "tastingTip": "Nên trộn đều bún với hến và rau trước khi ăn để cảm nhận đầy đủ hương vị. Có thể thêm chút ớt nếu thích vị cay miền Trung."
    },
    "1": {
      "cultureStory": "Thịt trâu lá trơng là món ăn thể hiện sự kết hợp giữa nguyên liệu chăn nuôi và cây lá bản địa của Quảng Trị. Lá trơng có hương thơm và vị cay đặc trưng, thường được dùng để chế biến cùng thịt trâu. Món ăn mang nét mộc mạc nhưng đậm đà, góp phần tạo nên dấu ấn riêng của ẩm thực vùng đất này.",
      "tastingTip": "Nên ăn khi thịt còn nóng để cảm nhận độ mềm của thịt trâu và mùi thơm của lá trơng. Có thể gọi thêm cơm trắng để cân bằng vị đậm của món ăn."
    },
    "2": {
      "cultureStory": "Bánh ít lá gai là món bánh truyền thống thường xuất hiện trong những dịp lễ, Tết và cúng giỗ của người dân Quảng Trị. Vỏ bánh được làm từ bột nếp trộn lá gai, tạo nên màu đen đặc trưng cùng độ dẻo thơm. Nhân bánh thường làm từ đậu xanh và dừa, mang vị ngọt bùi giản dị. Chiếc bánh nhỏ còn thể hiện tấm lòng thành kính với tổ tiên và tình cảm của người dân khi trao nhau món quà quê.",
      "tastingTip": "Nên bóc lớp lá chuối và thưởng thức bánh cùng trà nóng để cân bằng vị ngọt. Bánh cũng thích hợp mua về làm quà sau hành trình."
    },
    "3": {
      "cultureStory": "Cháo vạt giường là món ăn quen thuộc của người Quảng Trị, đặc biệt gắn với vùng Hải Lăng. Khác với cháo gạo thông thường, món này sử dụng những sợi bột cán và cắt thủ công, có hình dáng gợi liên tưởng đến những thanh vạt giường. Sợi bột được nấu cùng nước dùng cá, tạo nên món ăn nóng hổi, đậm đà. Đây là một nét đặc sắc trong cách người dân địa phương tận dụng nguyên liệu giản dị để tạo nên hương vị riêng.",
      "tastingTip": "Nên ăn ngay khi cháo còn nóng để sợi bột giữ được độ mềm dai. Thêm chút tiêu hoặc ớt tùy khẩu vị để làm nổi bật vị ngọt của cá."
    }
  },
  "hue": {
    "0": {
      "cultureStory": "Bún bò Huế là món ăn tiêu biểu của vùng đất cố đô, phát triển trong môi trường ẩm thực phong phú của Huế xưa. Nước dùng được ninh từ xương, kết hợp sả, ớt và mắm ruốc để tạo nên hương vị đậm đà đặc trưng. Sợi bún to cùng thịt bò, giò heo và chả tạo nên một tô bún hài hòa giữa vị cay, thơm và béo. Ngày nay, món ăn đã vượt khỏi phạm vi địa phương và trở thành một biểu tượng của ẩm thực Việt Nam.",
      "tastingTip": "Nên nếm nước dùng trước khi thêm gia vị, sau đó ăn kèm rau sống và chanh tùy khẩu vị. Nếu không ăn cay được, hãy dặn quán giảm ớt ngay khi gọi món.",
      "address": "Bún bò Huế Bà Tuyết 47 Nguyễn Công Trứ, TP. Huế"
    },
    "1": {
      "cultureStory": "Cơm hến gắn liền với đời sống dân dã của người dân vùng Cồn Hến bên sông Hương. Từ những nguyên liệu bình dị như cơm, hến, rau sống, đậu phộng và tóp mỡ, người Huế đã tạo nên món ăn có nhiều tầng hương vị. Vị cay của ớt, mùi mắm ruốc và vị ngọt của nước hến tạo nên nét riêng khó nhầm lẫn. Món ăn thể hiện sự khéo léo và khả năng tận dụng nguyên liệu địa phương trong văn hóa ẩm thực Huế.",
      "tastingTip": "Trộn đều cơm với hến, rau và gia vị trước khi ăn để cảm nhận đầy đủ các vị. Nếu chưa quen mắm ruốc hoặc ớt cay, hãy thêm từng chút một.",
      "address": "Cơm hến Hoa Đông Khu kiệt 7 Ưng Bình, phường Vĩ Dạ, TP. Huế"
    },
    "2": {
      "cultureStory": "Bánh bèo Huế nổi bật với những chiếc bánh nhỏ được hấp trong chén, thể hiện phong cách thưởng thức nhiều món với khẩu phần vừa phải của người Huế. Bánh làm từ bột gạo, phía trên thường có tôm chấy, hành phi hoặc tóp mỡ. Nước mắm được pha đậm vị, góp phần cân bằng độ mềm của bánh và vị thơm của nhân. Sự tỉ mỉ trong từng chiếc bánh cho thấy nét tinh tế của ẩm thực cố đô.",
      "tastingTip": "Dùng thìa nhỏ lấy bánh cùng phần nhân và nước mắm để cảm nhận trọn vẹn hương vị. Nên ăn khi bánh còn ấm để bánh mềm và thơm hơn.",
      "address": "Quán Hạnh 11 Phó Đức Chính, TP. Huế"
    },
    "3": {
      "cultureStory": "Bánh khoái là món bánh chiên đặc trưng của Huế, thường có vỏ vàng giòn và nhân tôm, thịt cùng giá đỗ. Món ăn dễ được nhận ra nhờ cách ăn kèm rau sống và nước lèo sánh đậm làm từ các nguyên liệu như đậu phộng. Bánh khoái mang nét gần gũi của ẩm thực đường phố nhưng vẫn đòi hỏi sự khéo léo trong khâu pha bột, chiên bánh và chuẩn bị nước chấm. Đây cũng là món ăn góp phần làm phong phú trải nghiệm ẩm thực của du khách khi đến cố đô.",
      "tastingTip": "Ăn ngay sau khi chiên để giữ lớp vỏ giòn, cuốn cùng rau sống rồi chấm nước lèo. Nên chia bánh để thưởng thức vừa đủ vì món này khá béo.",
      "address": "Bánh khoái Lạc Thiện 6 Đinh Tiên Hoàng, TP. Huế"
    }
  },
  "quangnam": {
    "0": {
      "cultureStory": "Mì Quảng gà là hương vị thân thuộc trong đời sống của người xứ Quảng. Sợi mì vàng mềm nằm dưới lớp thịt gà thấm gia vị, chan một lượng nước dùng vừa đủ, điểm thêm đậu phộng rang và rau sống. Mùi thơm của củ nén, vị bùi của đậu phộng cùng bánh tráng nướng tạo nên bản sắc riêng của món mì. Từ những nguyên liệu dân dã, người Quảng đã tạo nên món ăn đậm đà, hài hòa và mang dấu ấn quê hương.",
      "tastingTip": "Trộn nhẹ mì với phần nước dùng để gia vị thấm đều vào sợi mì và thịt gà. Bẻ bánh tráng mè nướng thành miếng nhỏ, thêm ngay trước khi ăn để giữ độ giòn. Ăn kèm rau sống, đậu phộng rang và chút ớt nếu thích vị cay nồng.",
      "address": "Tam Kỳ, Quảng Nam"
    },
    "1": {
      "cultureStory": "Giữa những con phố cổ vàng màu thời gian, cơm gà Hội An mang vẻ đẹp của một món ăn bình dị được chăm chút qua từng công đoạn. Hạt cơm vàng óng được nấu với nước luộc gà và nghệ, ăn cùng thịt gà xé, rau răm và hành tây. Sự kết hợp giữa cơm thơm, thịt gà săn ngọt và vị chua nhẹ của đồ ăn kèm tạo nên hương vị hài hòa. Món cơm gà đã trở thành một phần đáng nhớ trong hành trình khám phá ẩm thực phố Hội.",
      "tastingTip": "Ăn cơm khi còn nóng để cảm nhận hương thơm của gạo, nước luộc gà và nghệ. Trộn nhẹ thịt gà với rau răm, hành tây và nước mắm chua ngọt theo khẩu vị. Ăn kèm đu đủ hoặc hành tím ngâm chua nếu quán phục vụ để cân bằng vị béo.",
      "address": "Phố cổ Hội An, Quảng Nam"
    },
    "2": {
      "cultureStory": "Cao lầu là món ăn gắn liền với bản sắc ẩm thực phố Hội, nổi bật bởi sợi mì dày, dai và cách kết hợp nguyên liệu đặc biệt. Một tô cao lầu thường có thịt xá xíu, rau sống, tóp mỡ giòn và một lượng nước xốt vừa đủ. Món ăn gợi nhớ lịch sử giao thương lâu đời của Hội An, nơi nhiều ảnh hưởng văn hóa gặp gỡ và hòa quyện trong đời sống thường ngày. Nước giếng Bá Lễ thường được nhắc đến trong câu chuyện truyền thống về cao lầu, góp phần làm nên nét riêng của món ăn.",
      "tastingTip": "Trộn đều sợi cao lầu với nước xốt trước khi ăn. Kết hợp thịt xá xíu, rau sống và tóp mỡ trong cùng một miếng để cảm nhận độ dai, mềm, giòn và tươi. Ăn ngay sau khi trộn để tóp mỡ giữ độ giòn và rau không bị héo.",
      "address": "Phố cổ Hội An, Quảng Nam"
    },
    "3": {
      "cultureStory": "Bê thui Cầu Mống là đặc sản nổi tiếng của xứ Quảng, gắn với địa danh Cầu Mống thuộc khu vực Điện Bàn. Những lát thịt bê được thui đến độ chín vừa phải, phần thịt mềm ngọt, lớp da có độ giòn dai đặc trưng. Món ăn trở nên trọn vị nhờ rau sống, bánh tráng và mắm nêm đậm đà. Mỗi cuốn bê thui là sự kết hợp của thịt thơm, rau tươi, vị chua thanh và vị mặn mòi của nước chấm, thể hiện nét hào sảng trong cách ăn uống của người miền Trung.",
      "tastingTip": "Chọn cả phần thịt và da trong mỗi cuốn để cảm nhận sự khác biệt về kết cấu. Cuốn thịt cùng rau sống, chuối chát hoặc khế chua và bánh tráng nếu được phục vụ. Chấm mắm nêm vừa đủ, thêm chanh, tỏi hoặc ớt theo khẩu vị để cân bằng hương vị.",
      "address": "Cầu Mống, khu vực Điện Bàn, Quảng Nam"
    }
  },
  "gialai": {
    "0": {
      "cultureStory": "Phở khô hai tô là dấu ấn ẩm thực quen thuộc của Pleiku. Món ăn được trình bày trong hai tô riêng: một tô bánh phở trộn cùng thịt và gia vị, một tô nước dùng nóng. Cách ăn tưởng chừng đơn giản nhưng tạo nên trải nghiệm riêng, khi thực khách có thể cảm nhận vị đậm đà của phở khô xen kẽ với vị thanh ngọt của nước dùng. Từ món ăn bình dị trong đời sống thường ngày, phở khô đã trở thành một trong những hương vị được nhắc đến khi khám phá phố núi.",
      "tastingTip": "Thử phở trước khi thêm tương đen hoặc sa tế để cảm nhận vị nguyên bản. Trộn đều để gia vị phủ quanh sợi phở, sau đó điều chỉnh tương và ớt theo khẩu vị. Xen kẽ từng đũa phở với một thìa nước dùng nóng để cảm nhận đủ hai phần của món ăn.",
      "address": "Pleiku, Gia Lai"
    },
    "1": {
      "cultureStory": "Bò một nắng là món đặc sản nổi tiếng của khu vực Krông Pa, nơi nắng gió cao nguyên góp phần tạo nên câu chuyện riêng cho món thịt được tẩm ướp và phơi qua nắng. Khi nướng trên than hồng, miếng bò dậy mùi thơm, bên ngoài săn lại nhưng bên trong vẫn giữ được vị ngọt của thịt. Điểm nhấn đặc biệt là muối kiến vàng, loại gia vị có vị chua nhẹ, mặn và hương thơm độc đáo. Sự kết hợp này tạo nên trải nghiệm đậm chất núi rừng, khác biệt với những món thịt nướng thông thường.",
      "tastingTip": "Nướng thịt vừa chín tới, tránh để quá lâu khiến thịt khô và dai. Xé thịt thành miếng nhỏ rồi chấm một lượng muối kiến vàng vừa đủ. Ăn cùng rau thơm hoặc dưa leo nếu có để cân bằng vị đậm và chua mặn của gia vị.",
      "address": "Krông Pa, Gia Lai"
    },
    "2": {
      "cultureStory": "Bún cua thối là món ăn có cá tính mạnh mẽ của ẩm thực Gia Lai. Tên gọi bắt nguồn từ mùi đặc trưng của cua được ủ lên men, một nét hương vị có thể khiến người lần đầu thưởng thức bất ngờ. Khi kết hợp cùng bún, gia vị và các món ăn kèm, vị đậm của nước cua tạo nên trải nghiệm khác biệt so với những loại bún nước thông thường. Đây là món ăn cho thấy ẩm thực địa phương không chỉ hướng đến sự dễ ăn mà còn lưu giữ những khẩu vị riêng được hình thành trong đời sống cộng đồng.",
      "tastingTip": "Thử một lượng nhỏ nước dùng trước để làm quen với hương vị lên men. Ăn nóng và kết hợp với măng chua, rau sống hoặc các món ăn kèm của quán. Thêm ớt từ từ để tránh vị cay lấn át hương vị đặc trưng của nước cua.",
      "address": "Pleiku, Gia Lai"
    }
  },
  "daklak": {
    "1": {
      "cultureStory": "Gà nướng và cơm lam là sự kết hợp gợi nhớ những bữa ăn giữa núi rừng Tây Nguyên. Cơm lam được nấu trong ống tre hoặc nứa, gắn với nhu cầu chuẩn bị lương thực tiện lợi của những chuyến đi rừng. Khi nướng, hương tre quyện cùng mùi thơm của nếp, tạo nên vị dẻo thơm đặc trưng. Gà được tẩm ướp rồi nướng trên than hồng, ăn cùng cơm lam và muối chấm. Món ăn còn gợi hình ảnh bếp lửa, sự quây quần và nét hiếu khách của vùng cao nguyên.",
      "tastingTip": "Bóc lớp vỏ tre từ từ và ăn cơm lam khi còn ấm. Xé gà thành miếng vừa ăn, chấm muối ớt hoặc muối lá é nếu quán có phục vụ. Ăn xen kẽ gà nướng với cơm lam để cân bằng vị đậm của thịt và vị dẻo thơm của nếp.",
      "address": "Buôn Đôn, Đắk Lắk"
    }
  },
  "vungtau": {
    "0": {
      "cultureStory": "Món ăn của miền Trung và Nam Bộ. Bánh canh là món sợi làm từ bột gạo, chan nước dùng đậm đà cùng nhiều loại topping. Món này được người dân miền Trung và miền Nam yêu thích, và mỗi nơi lại có một biến tấu riêng, như bánh canh cá lóc, bánh canh thịt heo dày ở Trảng Bàng, bánh canh vịt hay bánh canh ghẹ. Thương hiệu gắn với giò heo. Long Hương nổi tiếng nhất với món bánh canh giò heo. Quán là một tên tuổi quen thuộc với người địa phương và khách ghé qua Bà Rịa, tồn tại khá lâu và có nhiều thực khách gắn bó. Món ăn dân dã này vì thế gắn với nếp sinh hoạt của người Bà Rịa: bữa sáng trước giờ làm, bữa tối muộn sau chuyến đi biển hay chuyến đường dài. Cái hồn của món. Theo giới sành ăn, ba yếu tố quyết định một tô bánh canh ngon là nước dùng, chả cá và sợi bánh. Với bánh canh giò heo thì thêm miếng giò hầm mềm, béo mà không ngấy.",
      "tastingTip": "Nếm nước dùng trước khi nêm. Đừng vội thêm gia vị. Hãy húp một muỗng để cảm nhận vị ngọt tự nhiên từ xương và giò, rồi mới chỉnh. Ăn khi còn nóng. Sợi bánh canh sẽ nở và mềm dần nếu để lâu, mất độ dai đặc trưng. Nêm theo thứ tự nhẹ tay. Thêm chút tiêu, vài lát ớt, một chút chanh hoặc quất nếu thích. Hành ngò và rau thơm cho vào sau cùng để giữ mùi thơm. Chấm giò riêng. Nếu gọi thêm giò, gắp ra chén nhỏ chấm nước mắm ớt hoặc muối tiêu chanh để vị đậm hơn và đỡ lấn át nước dùng. Ăn kèm bánh mì hoặc quẩy. Một số nơi có thói quen chấm bánh mì vào nước dùng. Bạn có thể hỏi quán có món ăn kèm không. Chọn giờ vắng. Tránh giờ cao điểm sáng và cuối tuần để được phục vụ nhanh và ngồi thoải mái hơn. Hỏi giá trước khi gọi thêm. Một vài đánh giá trên Foody phàn nàn tô giá khoảng 60 đến 65 nghìn, giò gọi thêm 45 nghìn một cục. Họ cho rằng nước dùng chỉ ở mức tạm ổn so với giá, dù cũng có người khen. Khẩu vị và giá có thể đã thay đổi, nên bạn xem menu hiện tại rồi tự đánh giá nhé. Lẩu súng Phước Hải",
      "address": "11 Cách Mạng Tháng Tám, Long Hương, Hồ Chí Minh, Việt Nam"
    },
    "1": {
      "cultureStory": "Làng chài trăm tuổi bên chân núi Minh Đạm. Phước Hải là một làng chài cổ nằm dưới chân núi Minh Đạm. Theo sử liệu địa phương, đầu thời Gia Long, hai làng Hải Chữ và Phước Điền sáp nhập thành thôn Phước Hải. Ngư dân ở đây sống gắn bó với biển, và nghề làm khô hải sản đã theo làng chài từ thuở ban đầu. Chợ Phước Hải cũng là khu chợ hải sản có tiếng, đầu mối phân phối hải sản đi nhiều tỉnh lân cận. Món ăn sinh ra từ biển và đồng nước. Lẩu súng là sự kết hợp bất ngờ giữa hải sản và rau đồng. Một bài giới thiệu mô tả món này là hương vị dân dã, kết hợp giữa cá biển tươi và bông súng giòn ngọt. Cá vừa lên bờ hợp với vị ngọt thanh của súng, nên nồi lẩu ngọt tự nhiên mà không nặng mùi. Đó cũng là cách người làng chài tận dụng cái sẵn có: cá tươi từ chợ, rau xanh từ vùng nước ngọt gần đó.",
      "tastingTip": "Chọn cá còn tươi. Ở làng chài, cá lên bờ trong ngày là lợi thế lớn nhất. Hỏi quán loại cá nào tươi nhất hôm nay thay vì chọn theo tên quen thuộc. Nhúng súng sau cùng. Bông súng chỉ nên nhúng khi nước đang sôi, đợi vài chục giây rồi vớt. Để lâu sẽ mềm và mất độ giòn. Ăn thịt cá trước, thêm rau sau. Cá chín nhanh, nên gắp ngay để không bị khô. Rau và bún cho vào sau khi nước đã ngọt vị cá. Nếm nước lẩu trước khi nêm. Vị chua nhẹ hoặc ngọt thanh thường đã cân bằng sẵn, nên nêm từ từ. Chấm nước mắm hoặc muối ớt. Một chút ớt xanh hoặc chanh giúp át mùi biển và tôn vị cá. Kết hợp ăn cùng hải sản khác. Gọi thêm đồ nướng hoặc gỏi cho bữa đủ đầy, nhưng nên ăn lẩu khi còn nóng. Đi sớm và đặt trước nếu đi nhóm. Một đánh giá trên Foody kể bạn đó gọi bốn món nhưng các món sau phải chờ hơn một tiếng ở một quán trong khu vực. Vì vậy hãy tránh giờ cao điểm cuối tuần, hoặc đặt món trước khi đến. Kết hợp dạo chợ. Nếu có thời gian, ghé chợ Phước Hải vào buổi sáng. Ở đây có thể trả giá để mua hải sản với mức tốt nhất. Rồi buổi tối quay lại thưởng thức lẩu.",
      "address": "làng chài Phước Hải, huyện Đất Đỏ, tỉnh Bà Rịa – Vũng Tàu"
    },
    "2": {
      "cultureStory": "Món ăn gắn với Vũng Tàu. Một cẩm nang về ẩm thực thành phố biển nhận xét: bánh khọt là những viên ngọc nhỏ ngon lành, và Vũng Tàu có lẽ là nơi tuyệt nhất để thử món này. Chỉ riêng con đường Hoàng Hoa Thám đã tập trung nhiều quán bánh khọt, nên thực khách thường chọn một quán rồi dạo quanh so sánh. Chiếc bánh nhỏ, cầu kỳ ở khâu làm. Bánh khọt được đổ trong khuôn gang tròn nhỏ. Bột gạo pha nước cốt dừa và nghệ cho màu vàng, đổ vào khuôn nóng có dầu, thêm tôm tươi rồi đậy nắp cho vàng giòn, bên trong mềm béo. Cách ăn cũng mang nét miền biển: cuốn bánh với rau sống, chấm nước mắm chua ngọt. Có quán còn cho thực khách ngồi xem đầu bếp đổ bánh, như một phần của trải nghiệm. Tình làng nghĩa xóm của các quán “Cô”. Nhiều quán bánh khọt ở Vũng Tàu mang tên một người phụ nữ như “Cô Ba”, “Cô Hai”, “Cô Năm”; có quán còn do chị em trong nhà cùng mở. Một thực khách trên Foody kể rằng, khi quán định ghé đóng cửa, chủ quán bên cạnh cho biết hai nơi là của chị em với nhau. Cách đặt tên này gợi sự thân tình và nghề gia truyền của người miền biển.",
      "tastingTip": "Ăn ngay khi bánh vừa ra lò. Bánh khọt ngon nhất khi vỏ còn giòn rụm, nguội đi sẽ mềm và ngấy dầu. Cuốn đúng cách. Đặt bánh lên lá xà lách hoặc lá cải xanh, thêm đồ chua (đu đủ, cà rốt) và rau thơm, rồi cuốn lại chấm nước mắm. Pha nước mắm vừa miệng. Nước chấm chua ngọt cân bằng sẽ làm nổi vị béo của nước cốt dừa. Thêm ớt hoặc tỏi nếu thích cay. Thử đủ nhân. Nếu quán có nhiều loại nhân (tôm, mực, hào, thịt), gọi mỗi thứ một ít để so sánh. Có quán trên Foody chỉ phục vụ bánh khọt tôm, nên bạn hỏi trước. Đừng ăn quá nhiều dầu. Bánh chiên nên ăn kèm nhiều rau và đồ chua để đỡ ngán, đồng thời hỗ trợ tiêu hóa. Chuẩn bị tinh thần chờ. Giờ cao điểm hoặc cuối tuần có thể đông. Một thực khách kể phải chờ hơn 30 phút cho 3 đĩa bánh khi quán có khoảng 20 khách. Đi sớm vào buổi sáng hoặc gọi trước nếu đi nhóm. Hỏi giá trước khi gọi. Các đánh giá ghi nhận bánh khọt tại khu vực Hoàng Hoa Thám dao động khoảng 55 đến 60 nghìn một phần, và ý kiến về chất lượng khá khác nhau giữa các quán. Hãy xem thực đơn và tự cảm nhận. Kết hợp dạo phố. Sau bữa ăn, bạn có thể đi dạo bãi Trước hoặc Bãi Sau gần đó để tiêu cơm.",
      "address": "117 Hoàng Hoa Thám, Vũng Tàu, Hồ Chí Minh 793990, Việt Nam"
    },
    "3": {
      "cultureStory": "Quán gia đình gắn với biển Vũng Tàu. Một cẩm nang ẩm thực gọi Gành Hào 1 là nhà hàng gia đình nổi tiếng ở Vũng Tàu. Nhiều du khách xem đây là điểm dừng chân quen thuộc khi đến thành phố biển. Có người còn nhận xét đây là một địa điểm kinh điển, đến Vũng Tàu là nhất định phải ghé. Vị trí sát bờ biển, nhìn ra mặt nước, khiến bữa ăn mang đúng không khí miền biển. Gỏi cá mai, món đặc sản của vùng biển Vũng Tàu. Cá mai là loại cá nhỏ, thân dẹt, thịt ngọt, sống thành đàn ở vùng biển miền Trung và Nam Bộ. Người Vũng Tàu thường lọc cá thật mỏng, trộn với chanh, dừa nạo, rau thơm và đậu phộng rang, rồi cuốn bánh tráng cùng rau sống và chấm nước mắm gừng hoặc tương xay. Vị chua thanh của chanh làm thịt cá se lại, kết hợp độ béo của dừa và đậu phộng, tạo nên một món vừa dân dã vừa thanh tao.",
      "tastingTip": "Gọi gỏi cá mai trước. Đây là món ngon nhất khi còn lạnh và mới trộn, nên dùng làm món khai vị. Cuốn vừa miệng. Đặt bánh tráng, thêm rau thơm, chuối chát hoặc khế nếu có, vài miếng gỏi và đậu phộng, rồi cuốn gọn. Đừng cuốn quá to để giữ được vị cân bằng. Pha nước chấm theo khẩu vị. Nước mắm gừng hợp với vị chua của gỏi. Nếu thích béo bùi, thử tương xay có đậu phộng. Thêm ớt và tiêu tùy sở thích, nhưng nếm trước một miếng để biết gỏi đã đủ vị chưa. Gọi đa dạng hải sản. Menu có cua, tôm, ghẹ và nhiều món khác. Ví dụ ốc hương nướng, cua gạch nướng, tôm rang trứng muối đều là các món được nhắc tới trong khu vực. Gọi vài món vừa phải rồi chia nhau để thử nhiều vị. Hỏi giá hải sản tính theo ký. Với cua, ghẹ và tôm, nên hỏi giá và cân trước khi chế biến để tránh bất ngờ lúc thanh toán. Một bài đánh giá ghi mức giá món ở đây từ 25.000 đến 165.000 đồng, nhưng hải sản tươi có thể cao hơn nhiều. Tránh giờ cao điểm. Cùng bài đó ghi nhận khi đông khách quán có thể thiếu chỗ để xe và phục vụ chậm. Bạn nên đi sớm hoặc đặt bàn, nhất là cuối tuần và dịp lễ. Chọn giờ hoàng hôn. Quán nằm bên biển nên bữa tối lúc chiều tà rất đẹp, nhưng nhớ đặt bàn gần cửa sổ hoặc phía ngoài từ trước.",
      "address": "03 Trần Phú, Vũng Tàu, Hồ Chí Minh, Việt Nam"
    }
  },
  "binhduong": {
    "0": {
      "cultureStory": "Bún tôm là món ăn sáng quen thuộc của người Bình Dương. Một bài giới thiệu ẩm thực địa phương cho biết bánh bèo bì và bún tôm là thức quà sáng quen thuộc của người dân tại đây. Món ăn dân dã, nấu từ nước dùng riêu tôm đậm đà, hợp với nhịp sống buổi sớm của người lao động và học sinh. Theo một đánh giá về quán Khang Anh trên Foody, bún tôm tích có vị riêu tôm đậm đà, tôm tít dai ngọt, kết hợp cà chua và bí đỏ. Cùng quán còn có bún mực với vị chua nhẹ, ngọt thanh.",
      "tastingTip": "Đi vào buổi sáng. Trang Foody ghi quán mở từ 6:30 đến 11:00 và từ 16:00 đến 21:00, nhưng giờ có thể đã thay đổi. Nếm nước dùng trước. Riêu tôm đã có vị ngọt tự nhiên, nên nêm thêm từ từ. Ăn nóng. Bún mềm nhanh trong nước nóng, nên hãy ăn ngay khi vừa dọn ra. Thêm rau sống, chanh và ớt vừa phải để cân bằng vị béo của riêu. Thử cả hai món. Nếu quán có bún mực, bạn có thể gọi một tô bún tôm và một tô bún mực để so sánh. Mức giá tham khảo trên Foody là 35.000 đến 50.000 đồng. Gỏi gà măng cụt Lái Thiêu",
      "address": "77 Phan Đình Giót, Thủ Dầu Một, Hồ Chí Minh, Việt Nam"
    },
    "1": {
      "cultureStory": "Gỏi gà măng cụt là sản phẩm của vùng vườn trái cây Lái Thiêu. Một bài viết cho biết người Bình Dương đã sáng tạo món gỏi tươi mát bằng cách kết hợp măng cụt Lái Thiêu với thịt gà. Món ăn này từng được nhắc đến rất nhiều trên các diễn đàn ẩm thực và đến nay vẫn là món nhất định phải thử khi ghé Bình Dương. Điều làm món gỏi đặc biệt nằm ở trái măng cụt. Theo mô tả của một tờ báo, gỏi được làm khi vỏ măng còn xanh nhưng phần cơm đã chín tới, giòn, ngọt và chua vừa phải. Vì vậy món ăn mang tính mùa vụ: khoảng giữa tháng 5 đến tháng 8 là thời điểm lý tưởng nhất để đến Lái Thiêu.",
      "tastingTip": "Đi đúng mùa măng cụt, từ tháng 5 đến tháng 8, để măng giòn và đủ vị. Ăn ngay khi dọn ra. Măng cụt ngâm lâu trong gỏi sẽ mất độ giòn. Người làm thường bỏ cơm măng vào nước đá để giữ màu trắng và độ giòn. Trộn đều trước khi ăn để thịt gà, măng, rau thơm và nước mắm ớt tỏi hòa quyện. Dùng cả da gà. Một bài viết cho biết gà làm gỏi dùng cả thịt lẫn da, nên đừng gạt bỏ phần da. Ăn cùng cháo hoặc xôi. Nhiều quán phục vụ gỏi gà kèm cháo gà. Một thực khách trên Foody kể quán còn bán thêm sầu riêng và măng cụt, nhưng giá cao hơn bên ngoài. Hỏi giá trước khi gọi. Một thực khách ghi lại rằng một con gà tre không kèm cháo giá khoảng 400 nghìn cho 3 người. Nên đi nhóm 3 đến 4 người để chia sẻ. Bánh bèo bì Mỹ Liên",
      "address": "Bình Nhâm 09, Thuận An, Bình Dương, Việt Nam"
    },
    "2": {
      "cultureStory": "Mỹ Liên là một thương hiệu lâu đời. Theo một bài báo, món bánh bèo bì ra đời hơn 100 năm trước và gắn với bà Đỗ Thị Kiểng. Tên quán là cách bà gọi theo em gái Nguyễn Thị Liên và con gái Nguyễn Thị Mỹ. Quán từng là nơi các nghệ sĩ cải lương nổi tiếng và nhiều người giàu từ TP.HCM cùng các tỉnh lân cận ghé thưởng thức. Nhiều thực khách vẫn đi xa chỉ để ăn đĩa bánh bèo ở đây, như một người kể là con của bạn mình phải chạy xuống Lái Thiêu cho đúng khẩu vị.",
      "tastingTip": "Chan nước mắm vừa đủ. Nước mắm ngọt chua sẽ làm bánh bèo thơm hơn, nhưng chan quá nhiều sẽ át vị bì và bột gạo. Trộn đều mọi thứ. Cho bì, đậu xanh, rau sống vào từng chén bánh để vị hòa quyện. Ăn kèm chả giò hoặc bì cuốn. Một thực khách nhận xét nem ăn cùng bánh bèo rất hợp. Đi buổi sáng. Đây vốn là món ăn sáng quen thuộc của người địa phương, bánh còn nóng và quán chưa đông. Hỏi giá hiện tại. Một số đánh giá ghi bánh bèo khoảng 30 đến 35 nghìn một đĩa và bì cuốn khoảng 9 nghìn một cuốn, nhưng giá có thể đã thay đổi. Gọi theo nhóm và chia sẻ, để thử cả bánh bèo, bì cuốn và chả giò mà không quá no.",
      "address": "188A KP. Thạnh Hòa A Tỉnh Lộ 745, TT. An Thạnh, Thị Xã Thuận An, Bình Dương"
    },
    "3": {
      "cultureStory": "Bò nướng ngói là một cách chế biến dân dã và độc đáo của miền Nam. Theo một bài giới thiệu, món này được người dân Bình Dương sáng tạo và rất phổ biến ở miền Nam nói chung. Người ta đặt miếng ngói đất sét sạch lên bếp than, đợi ngói nóng rồi mới nướng thịt bò. Cách này chín chậm hơn nướng trực tiếp trên than, nhưng hương vị ngon hơn nhiều. Ngói được chọn từ đất sét nung, màu đỏ tươi, và thịt bò thường là bò tươi, không ướp sẵn gia vị để giữ vị nguyên bản.",
      "tastingTip": "Đợi ngói thật nóng rồi mới đặt thịt, để bò chín đều và không dính. Tráng một lớp mỡ hoặc dầu lên ngói. Một bài hướng dẫn cho biết việc này giúp thịt không dính và thơm hơn. Bạn nên thêm dầu thường xuyên khi nướng. Nướng nhanh tay. Thịt bò thái mỏng chỉ cần khoảng 30 đến 60 giây mỗi mặt là chín tới. Nướng quá lâu thịt sẽ dai. Cuốn bánh tráng với rau sống. Gói bò nướng cùng rau thơm, dưa leo, khế hoặc chuối chát, rồi chấm nước chấm. Ở Bình Dương, mắm nêm là cách chấm rất được ưa chuộng. Gọi thêm rau củ nướng như hành tây, đậu bắp, cà tím hoặc nấm để cân bằng vị béo. Cẩn thận khi tiếp xúc ngói. Ngói rất nóng, nên gắp bằng kẹp và không chạm tay trực tiếp.",
      "address": "Unnamed, Road, Bình Dương, Hồ Chí Minh, Việt Nam"
    }
  },
  "binhphuoc": {
    "0": {
      "cultureStory": "Về món phở xào nói chung, đây là cách “đổi vị” quen thuộc của người Việt: bánh phở được xào trên chảo nóng với thịt, rau và nước sốt, cho ra sợi bánh xém cạnh, thấm đậm gia vị thay vì chan nước dùng.",
      "tastingTip": "Ăn ngay khi vừa xào xong. Phở xào ngon nhất khi còn nóng, sợi bánh dai và có độ xém nhẹ. Trộn đều rau sống và giá để vị thanh cân bằng với phần xào đậm. Nêm thêm chút tương ớt hoặc chanh nếu thích, nhưng nếm trước. Gọi thêm món ăn kèm. Với quán này, bạn có thể thử chả lá lốt hoặc nem cua bể, vì các nguồn khen những món này hợp với bún và nước mắm chua ngọt. Hỏi chỗ đậu xe. Quán có bãi đỗ ô tô, tiện đi nhóm hoặc gia đình.",
      "address": "46 Hoàng Văn Thái, Bình Phước, Đồng Nai, Việt Nam"
    },
    "1": {
      "cultureStory": "Bình Phước là thủ phủ điều của cả nước. Các huyện như Bù Gia Mập, Bù Đăng và Đồng Phú đã hình thành vùng chuyên canh điều với diện tích khoảng 140.000 ha. Hạt điều của tỉnh còn được bảo hộ: Bộ Khoa học và Công nghệ cấp văn bằng chỉ dẫn địa lý “Hạt điều Bình Phước” ngày 22/5/2018. Người địa phương không chỉ dùng hạt mà còn tận dụng cả trái điều. Một bài giới thiệu đặc sản nhắc đến gỏi trái điều, bánh hạt điều và hạt điều rang muối như những món đặc trưng của vùng đất này. Gỏi điều vì thế là món ăn kể câu chuyện của cả vườn điều: phần trái giòn chua ngọt, phần hạt béo bùi.",
      "tastingTip": "Trộn ngay trước khi ăn. Hạt điều rang sẽ mềm nếu để ngấm nước trộn lâu, nên cho hạt vào sau cùng để giữ độ giòn. Làm bớt vị chát của trái điều. Theo cách làm phổ biến, người ta thường bóp muối hoặc ngâm nước chanh rồi rửa sạch trước khi làm gỏi. Hãy hỏi quán họ xử lý thế nào. Cân bằng chua, cay, ngọt. Gỏi ngon khi nước trộn không quá chua và không át vị bùi của hạt. Ăn kèm rau thơm và bánh phồng tôm nếu quán có, để thêm độ giòn. Mua hạt điều làm quà đúng nơi. Nếu chọn hạt điều rang muối, hãy tìm sản phẩm có gắn chỉ dẫn địa lý “Hạt điều Bình Phước” để yên tâm về nguồn gốc. Bánh xèo bắp",
      "address": "562/1 QL14, Bình Phước, Đồng Nai 830000, Việt Nam"
    },
    "2": {
      "cultureStory": "Tên “bánh xèo” gợi âm thanh khi bột gạo chạm chảo nóng. Một bài viết giải thích rằng đây là loại bánh giống crepe, bột gạo được tráng mỏng trên chảo rộng, thêm nhân khi đang chín rồi gập lại. Mỗi vùng có một biến tấu riêng, và bánh xèo bắp có lẽ là cách dùng nguyên liệu địa phương của vùng đất nhiều nương rẫy.",
      "tastingTip": "Ăn khi còn nóng và giòn. Bánh xèo ngon nhất khi vỏ vừa ra chảo. Cuốn với rau xanh. Một tác giả ghi nhận người ăn thường cuốn bánh với các loại rau lá, như cải xanh hoặc xà lách, rồi chấm nước mắm. Pha nước chấm vừa miệng. Nước chấm thông thường gồm nước, chanh, đường, nước mắm và ớt hoặc tỏi băm. Bạn có thể thêm hoặc bớt tùy khẩu vị. Dùng tay. Xé bánh thành miếng vừa, thêm rau và chấm. Cách này giữ được độ giòn tốt hơn so với dùng đũa cắt nhỏ. Gọi ít một lần. Với bánh chiên, nên gọi từng đợt để luôn ăn món nóng.",
      "address": "Tổ 6, Khu phố 3A, thị xã Minh Hưng, Chơn Thành, Bình Phước (đường vành đai, phía sau chợ Minh Hưng)"
    },
    "3": {
      "cultureStory": "Heo thả rông là đặc sản của Bình Phước. Theo một bài giới thiệu, đây là giống heo do đồng bào dân tộc thiểu số quanh Sóc Bom Bo nuôi, mang tính bán hoang dã: ban ngày được thả đi tìm thức ăn, ban đêm trở về chuồng. Nhờ ăn rau củ và vận động nhiều, thịt heo săn chắc, ít mỡ và không ngấy. Nướng là một trong những cách chế biến được ưa chuộng nhất, bên cạnh luộc và chiên giòn",
      "tastingTip": "Nướng vừa lửa. Thịt ít mỡ nên dễ khô nếu nướng quá lâu. Hãy lấy ra khi mặt thịt vừa vàng xém. Ăn nóng, chấm đúng. Chấm muối ớt xanh, muối tiêu chanh hoặc mắm nêm để át béo và tôn vị ngọt của thịt. Cuốn rau sống. Gói thịt với bánh tráng, rau thơm và dưa leo cho bữa ăn cân bằng. Hỏi nguồn gốc. Nếu bạn muốn ăn heo thả rông đúng nghĩa, hãy hỏi quán heo được nuôi ở đâu và thịt từ phần nào. Gọi nhiều món. Có thể thử thêm món luộc hoặc chiên giòn để so sánh độ săn của thịt. Đặt trước nếu đi nhóm. Quán ở ven quốc lộ có thể đông vào cuối tuần, nên gọi báo trước.",
      "address": "xã Sóc Bom Bo, huyện Bù Đăng, tỉnh Bình Phước"
    }
  },
  "dongnai": {
    "0": {
      "cultureStory": "Đây là quán bữa sáng quen thuộc của dân Biên Hòa, rất đông khách nên phải nhanh chân mới có chỗ. Quán có bánh cuốn truyền thống và bánh cuốn trứng, nhân thịt bằm, nấm mèo, củ đậu, kèm cà phê, nha đam đường phèn, cam vắt. Một đánh giá ghi nhận bánh mỏng, ăn không ngán và nước mắm ngon.",
      "tastingTip": "Đi sớm. Quán đông vào buổi sáng, đến muộn dễ hết chỗ hoặc phải chờ. Ăn ngay khi bánh còn nóng, vì bánh mỏng nguội rất nhanh sẽ dính và mất độ mềm. Thử cả hai loại. Gọi một phần bánh cuốn thường và một phần bánh cuốn trứng để so sánh. Nêm nước mắm từ từ, thêm chút ớt hoặc tiêu nếu thích, nhưng nếm trước. Gọi thêm chả hoặc rau sống nếu quán có để ăn kèm cho đỡ ngán.",
      "address": "294 Phạm Văn Thuận, Khóm 3, Trấn Biên, Đồng Nai, Việt Nam"
    },
    "1": {
      "cultureStory": "Tân Triều là cù lao bưởi gần Biên Hòa. Một bài của Bộ Công Thương kể rằng sau năm 1869, cha xứ nhà thờ Tân Triều mang hai cây bưởi từ Brazil về trồng trước sân, và hai giống đặc thù nhất là bưởi đường lá cam và bưởi ổi.",
      "tastingTip": "Hỏi loại bưởi làm gỏi. Một bài báo cho biết gỏi ở đây dùng duy nhất bưởi Thanh. Ăn múi bưởi nguyên, không dập. Người làm gỏi tách múi cẩn thận để giữ mọng nước, nên bạn đừng trộn quá mạnh. Thử cùng rượu bưởi. Đây là cách kết hợp truyền thống, và rượu khá nhẹ nên người ít uống cũng dùng được. Kết hợp đi thuyền, hái bưởi để câu chuyện của món ăn trọn vẹn hơn. Mua bưởi hoặc quà đúng nơi. Bưởi Tân Triều đã có chỉ dẫn địa lý, nên bạn có thể hỏi nhãn nguồn gốc khi mua về. Chả lụi Ngọc Huyền",
      "address": "133/17 Hương Lộ 9, Tân Triều, Đồng Nai, Việt Nam"
    },
    "2": {
      "cultureStory": "Đường Huỳnh Văn Nghệ ở Bửu Long được gọi là “con đường chả lụi”, đi vài mét là gặp một quán. Chả lụi là đặc sản Biên Hòa, và một thực khách lưu ý rằng điểm đặc biệt nằm ở chén nước chấm ăn kèm hơn là miếng chả.",
      "tastingTip": "Ăn ngay khi vừa nướng. Chả còn nóng sẽ thơm, mỡ chảy nhẹ. Cuốn bánh tráng với rau và xoài sống. Một đánh giá cho biết chả mặn hợp với xoài chua và sốt ngọt. Chú ý nước chấm. Hãy thử một ít trước, vì đây là phần quyết định vị của món. Gọi vừa đủ. Ăn theo phần sẽ nóng và ngon hơn là gọi nhiều rồi để nguội. Chọn quán rộng, có chỗ để xe nếu đi nhóm, vì các quán trên đường này khá đông vào cuối tuần. Cơm niêu ngon",
      "address": "763 Huỳnh Văn Nghệ, Trấn Biên, Đồng Nai, Việt Nam"
    },
    "3": {
      "cultureStory": "Cơm niêu là kiểu ăn cơm nấu trong niêu đất, giữ nóng và thơm mùi cháy. Một thực khách ở Đồng Nai mô tả quán cơm niêu sẽ bưng cơm đựng trong niêu ra theo số lượng người ăn. Món thường ăn kèm cá kho tộ, canh chua, thịt kho, rau luộc.",
      "tastingTip": "Mở nắp niêu khi còn nóng, xới nhẹ để hơi thoát ra, cơm sẽ thơm và khô hạt. Ăn cháy ở đáy niêu. Đây là phần được nhiều người thích nhất. Gọi món kho, canh, rau cân bằng, ví dụ cá kho, canh chua và rau xào. Hỏi giá trước khi gọi. Một số quán cơm niêu giá không rẻ, nên xem thực đơn rồi mới quyết định. Đi theo nhóm để gọi nhiều món chia sẻ."
    }
  },
  "tphcm": {
    "0": {
      "cultureStory": "Cơm tấm là món đặc trưng của Nam Bộ. Một cây viết ẩm thực giải thích rằng gạo bị vỡ trong lúc vận chuyển hoặc xay xát, tạo nên kết cấu giống couscous. Đĩa cơm thường có sườn nướng, trứng ốp la, chả trứng, bì, dưa chua, hành lá và chén nước mắm pha. Phần bì là sợi da heo trộn thính gạo rang, còn chả là bánh thịt trứng hấp.",
      "tastingTip": "Trộn đều trước khi ăn. Cơm, mỡ hành, nước mắm và các món kèm cần hòa vào nhau. Rưới nước mắm vừa đủ, để hạt cơm ráo và không nhão. Ăn bì và chả cùng lúc, vì kết cấu mềm và giòn bổ sung nhau. Ăn với dưa leo và đồ chua để bớt ngấy phần thịt nướng. Đi giờ trưa hoặc tối sớm để sườn còn nóng.",
      "address": "Chung cư 35, Nguyễn Văn Tráng, Quận 1, Hồ Chí Minh 70000, Việt Nam"
    },
    "1": {
      "cultureStory": "Theo Michelin Guide, quán mở từ năm 1995 và phục vụ món Nam Bộ giản dị, điểm nhấn là bò lá lốt nướng than với vị mặn ngọt. Quán cũng có bánh hỏi ăn kèm thịt nướng. Một danh sách quán bún thịt nướng quận 3 nhận xét bún thịt nướng ở đây đậm hương vị cố đô. Với nhiều thực khách, đây là điểm dừng quen giữa lòng khu trung tâm.",
      "tastingTip": "Gọi cả bò lá lốt. Đây là món được Michelin nhắc đến trước tiên. Trộn bún với rau sống và nước mắm để mọi thứ thấm đều. Ăn nóng ngay sau khi nướng. Thịt nướng than ngon nhất khi vừa lên. Hỏi giờ mở cửa. Michelin ghi quán mở khoảng từ 8:30 đến 21:30, nhưng giờ có thể thay đổi. Chia sẻ món nếu đi nhóm để thử cả bún, bò lá lốt và chả giò.",
      "address": "321 Võ Văn Tần, Quận 3, Hồ Chí Minh 70000, Việt Nam"
    },
    "2": {
      "cultureStory": "Quán nằm trong khu Chợ Lớn, nhiều nguồn mô tả là đã bán gần 20 năm, phần lớn là khách quen. Điểm làm nên tên tuổi là bong bóng cá: súp cua vỉa hè thường dùng da heo, còn người Hoa nấu với bong bóng cá, nguyên liệu cao cấp hơn. Một tô thường có cua, trứng cuốn, trứng bắc thảo và bong bóng cá. Nhiều học sinh quanh khu này đã quen món từ thời đi học.",
      "tastingTip": "Đi trong giờ bán. Một bài viết ghi quán bán từ 11:00 đến 20:00. Chọn size phù hợp. Giá tham khảo trước đây khoảng 38.000 và 50.000 đồng, nay có thể cao hơn nên hãy hỏi lại. Thêm óc heo hoặc phần đặc biệt nếu bạn thích vị béo. Nếm trước khi nêm. Một người nhận xét hương vị khá nhạt, nên thêm tiêu hoặc chút tương ớt tùy khẩu vị.",
      "address": "239 Đ. Lương Nhữ Học, Chợ Lớn, Hồ Chí Minh, Việt Nam"
    },
    "3": {
      "cultureStory": "Tên quán có nguồn gốc dân dã: quán ban đầu không tên, người ghé ăn thấy mọi món đều đựng bằng tô nên gọi là “Ốc Tô,” về sau chủ lấy làm tên chính thức. Ốc Tô nằm trong khu Xóm Chiếu, được xem là “thiên đường ốc” của Sài Gòn. Điểm nổi bật là sốt me chua ngọt với xả ớt",
      "tastingTip": "Chấm bánh mì vào sốt me. Một đánh giá ghi rằng sốt mắm me ngon nhất khi chấm bánh mì. Đi buổi tối nhưng tránh giờ cao điểm. Quán thường đông sau 6 giờ tối. Gọi vài tô để chia sẻ. Nhiều thực khách ghi nhận mức giá khoảng 50.000 đồng một tô, nhưng hãy xác nhận lại. Đọc nhiều đánh giá. Ý kiến về quán trái chiều: có người khen sốt me và lượng nhiều, có người chê ốc nhỏ hoặc chưa tươi. Bạn nên chọn món ốc còn nóng và hỏi quán ốc nào mới về. Ăn nóng, và đừng ăn quá nhiều món cay cùng lúc.",
      "address": "224 Xóm Chiếu, Khánh Hội, Hồ Chí Minh, Việt Nam"
    }
  },
  "tayninh": {
    "0": {
      "cultureStory": "Một bài của Vietnam News gọi bánh canh Trảng Bàng là món ngon nhất để thưởng thức khi đến Tây Ninh. Có nhiều truyền thuyết về nguồn gốc, một trong số đó cho rằng món này có từ đầu thế kỷ 20, bắt nguồn từ các gia đình nông dân Tây Ninh. Theo một số đầu bếp, bí quyết nằm ở nguồn nước giếng chất lượng của Tây Ninh. Sợi bánh trắng, mềm dai, ăn với nước lèo ngọt từ xương heo, giò heo và rau sống.",
      "tastingTip": "Nếm nước lèo trước. Nước trong, ngọt thịt là dấu hiệu quán nấu đúng cách. Ăn nóng. Sợi bánh mềm nhanh trong nước, nên ăn ngay khi dọn. Chấm giò với nước mắm ớt, thêm rau sống và hành ngò để tăng vị. Thêm bánh tráng phơi sương cuốn thịt nếu quán có, vì đây là cặp đôi đặc trưng của Trảng Bàng. Đi sáng sớm, khi quán đông nhưng đồ ăn mới.",
      "address": "Suối Sâu, An Tịnh, Tây Ninh, Việt Nam"
    },
    "1": {
      "cultureStory": "Bò tơ là đặc sản nổi tiếng của Tây Ninh. Theo một cẩm nang, bò non được chọn kỹ, thịt mềm, nướng hoặc nhúng giấm, gói cùng rau sống, chuối chát và bánh tráng phơi sương. Tây Ninh còn có hơn 20 loại rau rừng độc đáo, chính là phần làm nên nét riêng của món cuốn này.",
      "tastingTip": "Cuốn đúng thứ tự: bánh tráng, rau rừng, chuối chát, thịt bò, rồi chấm nước mắm me. Nhúng giấm vừa chín tới, để thịt mềm và ngọt. Dùng chuối chát và rau rừng để át vị béo và tạo vị thanh. Thử cả bò nướng lẫn bò nhúng nếu quán có. Chấm muối ớt hoặc mắm me tùy khẩu vị.",
      "address": "73/1 Đ. Tân Mỹ, Tân Thuận, Hồ Chí Minh, Việt Nam"
    },
    "2": {
      "cultureStory": "Một bài về đặc sản mô tả bánh tráng phơi sương được tráng hai lớp, phơi khô, nướng sơ rồi phơi sương trong đêm để có độ dẻo mềm đặc trưng. Món thường cuốn thịt luộc, rau sống rồi chấm mắm nêm, hoặc ăn với muối tôm Tây Ninh. Một cẩm nang gọi muối tôm là “linh hồn” của vùng đất này.",
      "tastingTip": "Không cần nhúng nước. Bánh phơi sương đã mềm dẻo sẵn, nhúng nước sẽ làm nhão. Chấm muối tôm vừa đủ, vì muối cay và mặn khá đậm. Ăn kèm xoài xanh, rau răm để cân bằng vị. Thử bánh tráng trộn nếu quán có, kết hợp muối tôm, sa tế, trứng cút. Mua về làm quà. Hãy hỏi cách bảo quản và hạn dùng của muối tôm và bánh tráng.",
      "address": "Cua Thầy Qua, QL22, An Bình, An Tịnh, Tây Ninh, Việt Nam"
    },
    "3": {
      "cultureStory": "Ốc núi còn gọi là ốc xu núi Bà hay ốc Nàng Hai, là loài ốc cạn sống chủ yếu ở núi Bà Đen. Ốc nhỏ và dẹt hơn ốc bươu đồng. Món gắn liền với dịp hành hương, vì nhiều du khách ăn ốc sau khi leo núi hoặc đi cáp treo. Cách chế biến phổ biến gồm luộc, xào me, xào sa tế, xào dừa hoặc nướng.",
      "tastingTip": "Thử ốc luộc trước để cảm nhận vị ngọt nguyên bản, rồi gọi thêm món xào. Chấm muối ớt hoặc mắm gừng nếu ăn luộc. Dùng tăm hoặc que để lấy thịt ốc nhỏ. Hỏi nguồn gốc ốc. Ốc núi tươi là điểm quan trọng nhất của món này. Kết hợp với chuyến lên núi Bà Đen, ăn nhẹ sau khi leo núi. ĐỒNG BẰNG SÔNG CỬU LONG Ẩm thực miền Tây – Câu chuyện văn hóa và mẹo thưởng thức"
    }
  },
  "angiang": {
    "0": {
      "cultureStory": "Châu Đốc là vùng biên giới nơi người Kinh, Khmer, Chăm và Hoa cùng sinh sống, nên ẩm thực mang dấu ấn giao thoa. Bún cá nấu với cá đồng, nghệ vàng và sả, thường nêm thêm mắm bồ hóc cho vị đậm đà đặc trưng.",
      "tastingTip": "Ăn cùng rau đồng như bông súng, bắp chuối bào, và bông điên điển vào mùa nước nổi. Nếm nước dùng trước, chỉ thêm mắm hoặc ớt khi thấy cần. Ăn nóng và thêm chút chanh để vị cá thanh hơn.",
      "address": "92 Đường Trần Hưng Đạo, Châu Đốc, An Giang"
    },
    "1": {
      "cultureStory": "Lẩu mắm là món biểu tượng của miền Tây, ra đời từ thói quen làm mắm để dành trong mùa nước nổi. Nồi lẩu nấu từ mắm cá linh hoặc cá sặc, ăn với cả rổ rau đồng và bún tươi.",
      "tastingTip": "Nhúng rau theo thứ tự rau cứng trước, rau mềm sau để giữ độ giòn. Gắp thịt cá, thịt heo và hải sản ăn khi vừa chín. Đừng ngại mùi mắm ở lần đầu, nước lẩu càng sôi càng thơm dịu.",
      "address": "160 Trưng Nữ Vương, Châu Đốc, An Giang"
    },
    "2": {
      "cultureStory": "Cây thốt nốt là biểu tượng của vùng Bảy Núi và cộng đồng Khmer ở An Giang. Bánh bò làm từ nước thốt nốt có màu vàng, mùi thơm dịu, xốp mềm, thường ăn như món điểm tâm hoặc quà vặt ở chợ.",
      "tastingTip": "Ăn trong ngày để bánh giữ độ xốp mềm. Không nên để tủ lạnh vì bánh dễ khô cứng. Dùng kèm trà nóng hoặc nước dừa để cân bằng vị ngọt.",
      "address": "Nhà lồng chợ, Chi Lăng, Châu Đốc, An Giang"
    },
    "3": {
      "cultureStory": "Lá sầu đâu có vị đắng nhẹ, là nguyên liệu quen thuộc của người Khmer và miền Tây trong các món gỏi. Vị đắng đầu lưỡi rồi hậu ngọt tạo nên nét lạ, hợp ăn cùng tôm thịt, nước mắm chua ngọt.",
      "tastingTip": "Trộn gỏi ngay trước khi ăn để lá giữ được độ giòn. Lần đầu nên ăn lượng vừa phải để làm quen vị đắng. Cuốn bánh tráng cùng rau thơm sẽ bớt đắng và dễ ăn hơn.",
      "address": "90 Đường Trưng Nữ Vương, Châu Đốc, An Giang 88000"
    }
  },
  "baclieu": {
    "0": {
      "cultureStory": "Bún nước lèo có gốc từ cộng đồng Khmer ở Nam Bộ, nước dùng nấu từ mắm bồ hóc, cá lóc và sả. Món được người Bạc Liêu và Sóc Trăng giữ gìn như một phần ẩm thực quê hương.",
      "tastingTip": "Ăn với rau sống, giá và bông súng bào để cân vị mắm. Nêm ớt, chanh vừa phải, đừng át vị mắm đặc trưng. Ăn khi còn nóng để nước lèo thơm trọn vẹn.",
      "address": "649 Trần Phú, Bạc Liêu, Cà Mau"
    },
    "1": {
      "cultureStory": "Vùng ven biển Bạc Liêu có nguồn cá, tôm nước lợ phong phú nên lẩu cá là món gắn với bữa quây quần. Nồi lẩu cá bống mú thường nấu chua nhẹ để giữ vị ngọt của thịt cá.",
      "tastingTip": "Nhúng cá khi nước sôi, vừa chín tới là ăn để thịt không bị khô. Ăn cùng rau ghém và bún tươi. Chấm nước mắm gừng hoặc muối ớt để tôn vị cá.",
      "address": "52/3 Tôn Đức Thắng, Khóm 5, Phường 7, TP. Bạc Liêu"
    },
    "2": {
      "cultureStory": "Bánh tằm bì là món ăn của vùng Hậu Giang – Bạc Liêu, sợi bánh tằm nhỏ trộn nước cốt dừa, bì heo và rau sống. Món có ảnh hưởng của ẩm thực người Hoa, dân dã nhưng béo thơm.",
      "tastingTip": "Trộn đều bánh, bì và rau để nước cốt dừa thấm đều. Rưới nước mắm vừa đủ, đừng làm bánh nhão. Rắc thêm đậu phộng hoặc hành phi nếu quán có.",
      "address": "246 Cách Mạng, khóm 7, Bạc Liêu, Cà Mau 97000"
    },
    "3": {
      "cultureStory": "Bún bò cay là phiên bản đậm vị của món bún bò gốc Huế, được người miền Tây điều chỉnh theo khẩu vị ưa cay và thơm mùi sả. Món phù hợp bữa sáng hoặc bữa trưa nhanh gọn.",
      "tastingTip": "Nếm nước dùng trước khi thêm sa tế. Ăn kèm rau sống, bắp chuối, giá để dịu vị cay. Thêm chút chanh để nước dùng thanh hơn.",
      "address": "Đường Lê Lợi, Bạc Liêu, Cà Mau"
    }
  },
  "bentre": {
    "0": {
      "cultureStory": "Hủ tiếu là món ăn phổ biến khắp Nam Bộ, mỗi nơi có biến tấu riêng. Hủ tiếu mực dùng mực tươi với nước dùng xương ngọt, phản ánh vùng đất gần sông biển của Bến Tre.",
      "tastingTip": "Ăn khi mực còn dai ngọt, đừng để ngâm lâu trong nước nóng. Chấm mực với nước tương ớt nếu quán dọn kèm. Thêm giá và hẹ để vị thanh và đầy đặn hơn.",
      "address": "89 Đồng Văn Cống, Bến Tre, Vĩnh Long"
    },
    "1": {
      "cultureStory": "Cá tai tượng là đặc sản miền Tây, được chiên xù để dựng đứng như chiếc tai voi và bày giữa bàn. Món thường ăn theo kiểu cuốn bánh tráng, rau sống và chấm nước mắm me.",
      "tastingTip": "Ăn nóng để da cá còn giòn. Cuốn đủ rau thơm, chuối chát, khế để cân vị béo. Chấm nước mắm me hoặc mắm nêm tùy khẩu vị.",
      "address": "9 Đ. 3/2, ấp Mỹ, Cầu Ngang, Vĩnh Long 87806"
    },
    "2": {
      "cultureStory": "Bến Tre là xứ dừa nên nước cốt dừa là linh hồn của nhiều món ngọt. Chuối nếp nướng là món quà vặt dân dã, vỏ nếp dẻo thơm, chuối ngọt, rưới nước cốt dừa béo nhẹ.",
      "tastingTip": "Ăn nóng ngay khi nướng xong để nếp mềm, nước cốt dừa thơm. Chờ nguội bớt vài phút để tránh bỏng. Dùng kèm trà hoặc cà phê để cân vị ngọt.",
      "address": "54D Đ. Nguyễn Văn Tư, Bến Tre, Vĩnh Long"
    },
    "3": {
      "cultureStory": "Đuông dừa là ấu trùng sống trong thân cây dừa, từ lâu được xem là đặc sản lạ của xứ dừa. Món \"tắm nước mắm\" là cách ăn truyền thống, thường dùng với rượu hoặc nước mắm tỏi ớt.",
      "tastingTip": "Lần đầu nên thử đuông chiên hoặc nướng trước, dễ ăn hơn. Ăn kèm rau thơm và chút ớt để át vị béo. Người dễ dị ứng nên hỏi kỹ trước khi dùng.",
      "address": "Ấp 6B, xã An Khánh, huyện Châu Thành, tỉnh Bến Tre"
    }
  },
  "camau": {
    "0": {
      "cultureStory": "Bún nước lèo ở Cà Mau cũng mang hương vị mắm bồ hóc quen thuộc của vùng Khmer. Bì là phần da heo ăn kèm, tạo độ giòn dai, thường có mặt trong các quán bún ở đây.",
      "tastingTip": "Trộn đều bì với bún và rau trước khi chan nước lèo. Nêm mắm vừa miệng, tránh quá mặn. Ăn cùng ớt hiểm hoặc chanh nếu thích vị thanh.",
      "address": "6 Đ. Hùng Vương, Tân Thành, Cà Mau"
    },
    "1": {
      "cultureStory": "Cà Mau nổi tiếng với cua Năm Căn, thịt chắc, gạch béo. Cua rang me kết hợp vị chua ngọt của me và độ béo của cua, là món hiếm khi vắng trong bữa tiệc hải sản.",
      "tastingTip": "Ăn khi còn nóng, nhất là phần càng và gạch. Chấm bánh mì vào sốt me để không bỏ sót vị. Hỏi giá theo ký trước khi gọi để tránh bất ngờ.",
      "address": "129b đường 3/2, phường 5, Tân Thành, Cà Mau 970000"
    },
    "2": {
      "cultureStory": "Bánh tằm cay và xíu mại là món ăn có ảnh hưởng của cộng đồng người Hoa ở Cà Mau. Sợi bánh tằm chan nước sốt cay, ăn cùng xíu mại, là món ăn vặt hoặc bữa nhẹ quen thuộc.",
      "tastingTip": "Trộn đều sợi bánh với sốt trước khi ăn. Thêm rau thơm hoặc hành phi để tăng độ thơm. Nếu không ăn cay, hỏi quán giảm ớt trước khi gọi.",
      "address": "17 Lý Bôn, Lâm Thành Mậu, An Xuyên, Cà Mau"
    },
    "3": {
      "cultureStory": "Cà Mau là vùng đất có biển bao quanh, nên lẩu cá biển là món thường thấy trong các bữa tụ họp. Thịt cá bớp dày, ngọt, hợp nấu lẩu chua hoặc lẩu thanh.",
      "tastingTip": "Nhúng cá vừa chín tới để thịt giữ độ dai ngọt. Ăn kèm rau đồng và bún để cân vị. Chấm nước mắm gừng hoặc muối ớt xanh.",
      "address": "796 Đ. Tạ Uyên, An Xuyên, Cà Mau"
    }
  },
  "cantho": {
    "0": {
      "cultureStory": "Hủ tiếu sườn gắn với nếp ăn sáng của người Cần Thơ, nước dùng ninh từ xương nên ngọt thanh. Quán có thêm hủ tiếu mực và bún Thái, cho thấy sự phong phú của ẩm thực đô thị.",
      "tastingTip": "Nếm nước dùng trước, chỉ nêm thêm khi cần. Ăn sườn khi còn nóng để thịt mềm. Dùng rau sống và giá để thêm độ giòn. Cá lóc nướng trui cuốn bánh tráng",
      "address": "Đ. Nguyễn Sĩ Liên, cầu Hưng Lợi, Tân An, Cần Thơ"
    },
    "1": {
      "cultureStory": "Cá lóc nướng trui là món gắn với đồng ruộng Nam Bộ: cá nướng nguyên con trên rơm hoặc than cho da cháy xém và thịt thơm ngọt. Món thường gỡ cá cuốn bánh tráng, rau sống, chấm nước mắm me hoặc mắm nêm.",
      "tastingTip": "Ăn ngay khi vừa nướng xong, thịt cá còn nóng, ngọt. Cuốn kèm rau thơm, chuối chát, khế cho cân vị. Chấm mắm me hoặc mắm nêm tùy khẩu vị.",
      "address": "Suối Sâu, An Tịnh, Tây Ninh"
    },
    "2": {
      "cultureStory": "Bánh cống là món ăn vặt đặc trưng miền Tây, làm từ bột gạo, đậu xanh, tôm và thịt, chiên giòn trong khuôn. Món thường được ăn cuốn rau xà lách, chấm nước mắm chua ngọt.",
      "tastingTip": "Ăn khi bánh còn nóng giòn. Cuốn với rau sống và chấm nước mắm vừa đủ. Gọi từng đợt nhỏ để bánh luôn vừa chiên.",
      "address": "86/38 Đ. Lý Tự Trọng, Ninh Kiều, Cần Thơ"
    },
    "3": {
      "cultureStory": "Vịt là nguyên liệu quen thuộc của miền Tây sông nước. Chao (đậu hũ lên men) tạo vị bùi mặn đặc trưng, giúp khử mùi vịt và làm nước lẩu thơm đậm.",
      "tastingTip": "Ăn thịt vịt khi còn nóng, kèm rau và bún. Chấm muối tiêu chanh hoặc nước chấm chao nếu quán có. Nhúng rau sau cùng để giữ độ giòn.",
      "address": "96a Đ. Trần Khánh Dư, Ninh Kiều, Cần Thơ"
    }
  },
  "dongthap": {
    "0": {
      "cultureStory": "Sa Đéc là vùng nổi tiếng với hoa kiểng và các món hủ tiếu, sợi bánh dai, nước dùng ngọt thanh. Hủ tiếu ở đây là món ăn sáng quen thuộc của người địa phương và du khách ghé chợ.",
      "tastingTip": "Nếm nước dùng trước khi nêm thêm. Ăn với rau sống và giá để thêm độ giòn. Ăn nóng để sợi hủ tiếu giữ độ dai.",
      "address": "188 Đường Trần Hưng Đạo, Khóm 1, Sa Đéc, Đồng Tháp"
    },
    "1": {
      "cultureStory": "Cá linh và bông điên điển là hai biểu tượng của mùa nước nổi miền Tây, thường xuất hiện từ khoảng tháng 8 đến tháng 11. Lẩu cá linh nấu chua nhẹ, nhúng bông điên điển cho vị bùi, ngọt thanh.",
      "tastingTip": "Đi vào mùa nước nổi để cá linh tươi và bông điên điển non. Nhúng bông điên điển sau cùng, vừa chín tới. Ăn cùng bún và rau đồng, chấm mắm kho hoặc nước mắm gừng.",
      "address": "324 QL80, Lấp Vò, Đồng Tháp"
    },
    "2": {
      "cultureStory": "Nem Lai Vung là đặc sản nổi tiếng của vùng, được làm từ thịt heo, bì, thính gạo và gói lá. Nem có vị chua nhẹ, dai giòn, thường là món nhậu hoặc quà mang về.",
      "tastingTip": "Ăn cùng lá chùm ruột hoặc lá vông, ớt, tỏi. Bảo quản nơi mát, dùng sớm để giữ độ ngon. Mua quà từ cơ sở có nhãn mác rõ ràng.",
      "address": "85 Tân Khánh, Lai Vung, Đồng Tháp"
    },
    "3": {
      "cultureStory": "Chuột đồng là món ăn gắn với mùa gặt ở miền Tây, khi chuột sống trong ruộng lúa và ăn lúa chín. Nướng lu là cách làm dân dã, giữ thịt săn và thơm.",
      "tastingTip": "Chọn quán uy tín, thịt nấu chín kỹ. Ăn nóng, chấm muối tiêu chanh hoặc mắm me. Người ăn lần đầu nên gọi phần nhỏ để thử.",
      "address": "204 Thiên Hộ Dương, Cao Lãnh, Đồng Tháp"
    }
  },
  "haugiang": {
    "0": {
      "cultureStory": "Bún mắm là món đặc trưng của miền Tây, nấu từ mắm cá lọc xương cùng tôm, mực, thịt heo quay và rau đồng. Hương vị đậm đà phản ánh cách người dân sông nước biến mắm dự trữ trong mùa nước nổi thành món ăn đầy đặn.",
      "tastingTip": "Ăn nóng cùng rau sống, bông súng và bắp chuối bào. Thử nước dùng trước, chỉ thêm ớt hoặc chanh khi cần. Gắp thịt quay và tôm khi còn nóng để giữ độ giòn và ngọt.",
      "address": "89 Trưng Nhị, Phường 1, TP. Vị Thanh, Hậu Giang"
    },
    "1": {
      "cultureStory": "Hậu Giang nổi tiếng với vùng trồng khóm (dứa), nên khóm xuất hiện trong nhiều món canh, xào và lẩu. Khóm xào hải sản kết hợp vị chua ngọt của trái cây với độ ngọt của tôm, mực, cho món ăn tươi và dễ ăn.",
      "tastingTip": "Ăn nóng để khóm giữ độ giòn và hải sản không bị dai. Dùng kèm cơm trắng để cân vị chua ngọt. Hỏi quán mức độ ngọt nếu bạn không thích vị khóm quá đậm.",
      "address": "116 - 118 Nguyễn Thái Học, Phường 1, TP. Vị Thanh, Hậu Giang"
    },
    "2": {
      "cultureStory": "(cần thêm thông tin về món)",
      "tastingTip": "(cần thêm thông tin về món)",
      "address": "Số 16 Ngô Quốc Trị, Phường 5, TP. Vị Thanh, Hậu Giang"
    },
    "3": {
      "cultureStory": "Cái Tắc là ngã ba đường nằm trên tuyến đi Cần Thơ – Vị Thanh, nên quán ăn ven đường có truyền thống phục vụ khách qua lại. Cháo lòng nấu từ gạo nhừ, nước dùng ngọt xương, ăn kèm lòng heo, tiết và hành ngò.",
      "tastingTip": "Ăn cháo khi còn nóng, thêm tiêu và hành phi cho thơm. Chấm lòng với nước mắm gừng hoặc mắm ớt. Dùng kèm rau sống hoặc giá để bớt ngấy.",
      "address": "Số 69/2 Quốc lộ 61, thị trấn Cái Tắc, huyện Châu Thành A, Hậu Giang (đối diện chợ Cái Tắc)"
    }
  },
  "kiengiang": {
    "0": {
      "cultureStory": "Rạch Giá là thành phố cảng, cá biển là nguyên liệu quen thuộc trong bữa ăn hằng ngày. Bún cá thu có nước dùng ngọt thanh từ cá, thường ăn kèm chả cá, rau sống và chút ớt.",
      "tastingTip": "Nếm nước dùng trước khi thêm gia vị. Ăn nóng cùng rau sống và giá. Thêm chút chanh hoặc ớt để tăng vị.",
      "address": "60 Phạm Hùng, Rạch Giá, An Giang 92000"
    },
    "1": {
      "cultureStory": "Gỏi cá trích là món nổi tiếng của đảo ngọc, làm từ cá trích tươi trộn dừa nạo, rau thơm, đậu phộng và chanh. Món thường được cuốn bánh tráng cùng rau sống rồi chấm nước chấm đặc trưng của đảo.",
      "tastingTip": "Ăn ngay sau khi trộn để cá giữ độ tươi và giòn. Cuốn vừa miệng với rau thơm, khế hoặc chuối chát. Chọn quán uy tín vì món có cá tươi, nên hỏi nguồn cá khi cần. Bánh ống lá dứa",
      "address": "66 Đường Trần Hưng Đạo, Khu 1, Phú Quốc, An Giang"
    },
    "2": {
      "cultureStory": "Bánh ống lá dứa là món ăn vặt dân dã, hấp từ bột gạo thơm mùi lá dứa, thường ăn cùng dừa nạo và đường. Mùi lá dứa ngọt dịu tạo nên hương vị đặc trưng cho các món bánh miền Tây.",
      "tastingTip": "Ăn khi bánh còn ấm để giữ độ mềm. Rắc dừa nạo và chấm chút muối mè hoặc đường tùy sở thích. Dùng kèm trà nóng cho dễ ăn.",
      "address": "Số 22 Nguyễn Trung Trực, TP. Rạch Giá, Kiên Giang (đối diện cửa hàng giày dép Biti's)"
    },
    "3": {
      "cultureStory": "Lẩu chua nấu với sả và nghệ là cách làm quen thuộc của vùng ven biển, giúp át mùi tanh và làm nước dùng thơm. Món thường kết hợp hải sản hoặc cá tươi và rau đồng.",
      "tastingTip": "Nhúng hải sản vừa chín tới để giữ vị ngọt. Nêm chua cay theo khẩu vị bằng chanh hoặc ớt. Ăn kèm bún và rau sống để cân vị.",
      "address": "Số 415 Lâm Quang Ky, phường Vĩnh Lạc, TP. Rạch Giá, Kiên Giang"
    }
  },
  "longan": {
    "0": {
      "cultureStory": "Hủ tiếu là món ăn sáng quen thuộc của cả Nam Bộ, và Long An cũng có những quán hủ tiếu gắn với thói quen ăn sáng của người địa phương. Hãy thay mã Plus Code bằng tên đường hoặc phường để người đọc dễ tìm.",
      "tastingTip": "Nếm nước dùng trước khi nêm. Ăn nóng cùng giá và rau sống. Thêm chút tương ớt hoặc tiêu theo khẩu vị."
    },
    "1": {
      "cultureStory": "Canh chua là món cơm hằng ngày của người miền Tây, nấu từ cá đồng cùng rau đồng và vị chua thanh. Cá chốt là loại cá nhỏ nước ngọt, thịt mềm, thường dùng trong các món canh và kho.",
      "tastingTip": "Ăn nóng cùng cơm trắng. Chấm cá với nước mắm ớt hoặc muối tiêu chanh. Thêm bông súng hoặc rau đồng nếu quán có."
    },
    "2": {
      "cultureStory": "Cần Đước là vùng nổi tiếng với lạp xưởng tươi, làm từ thịt heo, mỡ và gia vị, ăn nướng rất thơm. Món gắn với thói quen mua làm quà hoặc nướng ăn vặt ở chợ.",
      "tastingTip": "Nướng lửa vừa để lạp xưởng chín đều, không cháy ngoài. Ăn nóng cùng dưa leo, đồ chua và bánh mì hoặc bánh tráng. Chấm tương ớt hoặc nước mắm chua ngọt.",
      "address": "Trần Hưng Đạo, Cần Đước, Tây Ninh"
    },
    "3": {
      "cultureStory": "Bún xiêm lo là món bún nước đặc trưng ở Long An, nước dùng ngọt, ăn kèm thịt và rau. Món gắn với bữa sáng hoặc bữa trưa nhanh của người địa phương.",
      "tastingTip": "Nếm nước dùng trước khi nêm. Ăn nóng cùng rau sống. Thêm ớt hoặc chanh nếu thích vị đậm.",
      "address": "54 Hùng Vương, Long An, Tây Ninh"
    }
  },
  "soctrang": {
    "0": {
      "cultureStory": "Bún nước lèo gắn với cộng đồng Khmer ở Sóc Trăng, nước dùng nấu từ mắm bồ hóc, cá lóc và sả, ăn kèm thịt heo quay, tôm và rau. Món được xem là đặc sản tiêu biểu của vùng đất nhiều chùa Khmer.",
      "tastingTip": "Ăn cùng rau sống, bông súng và giá. Nêm chanh, ớt vừa phải để không át vị mắm. Ăn nóng để nước dùng thơm trọn vẹn.",
      "address": "60 Lê Lợi, Khóm 4, Sóc Trăng, Cần Thơ"
    },
    "1": {
      "cultureStory": "Bún gỏi dà là món bún trộn kiểu gỏi đặc trưng của Sóc Trăng, kết hợp bún, rau thơm và nước chấm đậm vị. Món thường là bữa sáng hoặc trưa nhẹ của người địa phương.",
      "tastingTip": "Trộn đều trước khi ăn để nước chấm thấm đều. Ăn kèm rau sống để cân vị. Thêm chút ớt hoặc chanh theo khẩu vị.",
      "address": "13 Nguyễn Văn Hữu, Phú Lợi, Cần Thơ"
    },
    "2": {
      "cultureStory": "Bánh pía là món bánh có nguồn gốc từ người Hoa Triều Châu, nay trở thành đặc sản nổi tiếng của Sóc Trăng. Vỏ bánh nhiều lớp mỏng, nhân đậu xanh, sầu riêng, trứng muối hoặc khoai môn, thường mua làm quà.",
      "tastingTip": "Ăn cùng trà nóng để cân vị ngọt béo. Bảo quản nơi khô ráo, dùng trong hạn ghi trên bao bì. Thử vài loại nhân khác nhau để chọn vị hợp khẩu vị.",
      "address": "130-132-134-136 Đ. Lý Thường Kiệt, Phú Lợi, Cần Thơ"
    },
    "3": {
      "cultureStory": "Mắm bồ hóc là gia vị truyền thống của người Khmer, làm từ cá nước ngọt lên men. Lẩu mắm bồ hóc mang vị đậm đà đặc trưng, nấu cùng cá, tôm và nhiều rau đồng.",
      "tastingTip": "Nhúng rau cứng trước, rau mềm sau. Ăn cùng bún tươi và rau sống. Làm quen mùi mắm bằng cách thử nước dùng trước.",
      "address": "203 Hùng Vương, Sóc Trăng, Cần Thơ"
    }
  },
  "tiengiang": {
    "0": {
      "cultureStory": "Hủ tiếu Mỹ Tho là một trong những món hủ tiếu nổi tiếng nhất của Nam Bộ, sợi dai, nước dùng ngọt từ xương và tôm khô. Món gắn với thành phố ven sông Tiền, thường ăn vào buổi sáng.",
      "tastingTip": "Thử cả hủ tiếu nước và hủ tiếu khô nếu quán có. Nêm tương, ớt vừa phải. Ăn nóng cùng rau sống và giá.",
      "address": "10 Trần Quốc Toản, Mỹ Tho, Đồng Tháp"
    },
    "1": {
      "cultureStory": "Cái Bè nằm giữa vùng sông nước và vườn cây trái của Tiền Giang, nên lẩu cá đồng và rau đồng là cách ăn quen thuộc. Nồi lẩu thường nấu chua nhẹ, ăn cùng bún và rau.",
      "tastingTip": "Nhúng cá vừa chín tới để giữ vị ngọt. Ăn cùng rau đồng và bún tươi. Chấm nước mắm gừng hoặc muối ớt.",
      "address": "258a Khu 2 Trương Công Định, Cái Bè, Đồng Tháp"
    },
    "2": {
      "cultureStory": "Bánh giá là món ăn vặt chiên giòn từ bột gạo với giá và tôm, quen thuộc ở chợ vùng Tiền Giang. Món ăn dân dã cuốn rau sống, chấm nước mắm chua ngọt.",
      "tastingTip": "Ăn ngay khi bánh còn nóng và giòn. Cuốn với xà lách và rau thơm. Chấm nước mắm vừa đủ để không làm bánh mềm.",
      "address": "205 Cô Giang, Vĩnh Bình, Đồng Tháp"
    },
    "3": {
      "cultureStory": "Cá lóc là loài cá đồng quen thuộc của miền Tây, thịt ngọt chắc, rất hợp nấu cháo. Cháo cá lóc thường ăn kèm rau răm, hành và tiêu, là món bồi bổ nhẹ.",
      "tastingTip": "Ăn nóng, thêm rau răm và tiêu. Chấm cá với nước mắm gừng. Gọi vừa đủ để giữ cháo luôn nóng.",
      "address": "113 Phan Thanh Giản, Mỹ Tho, Đồng Tháp"
    }
  },
  "travinh": {
    "0": {
      "cultureStory": "Bún suông là món bún nước đặc trưng của Trà Vinh, có nước dùng ngọt từ xương và tôm, ăn kèm giò, thịt và rau. Quán ghi \"since 1986\" cho thấy truyền thống gia truyền gắn bó nhiều năm với người địa phương.",
      "tastingTip": "Nếm nước dùng trước khi nêm. Ăn nóng cùng rau sống. Thêm chanh hoặc ớt tùy khẩu vị.",
      "address": "644 đường Võ Nguyên Giáp, Khóm 1, Nguyệt Hóa, Vĩnh Long"
    },
    "1": {
      "cultureStory": "Dừa là biểu tượng của Bến Tre – Trà Vinh, và cơm nướng dừa là cách sáng tạo để giữ hương dừa trong từng hạt cơm. Cơm nấu trong trái dừa có vị thơm ngọt nhẹ, thường ăn cùng món mặn.",
      "tastingTip": "Xới cơm khi còn nóng để mùi dừa dậy lên. Ăn cùng thịt kho, cá kho hoặc món chiên. Nếu thích cơm khô, hãy xới đều trước khi ăn.",
      "address": "77 Phạm Ngũ Lão, Trà Vinh, Vĩnh Long"
    },
    "2": {
      "cultureStory": "Bánh tét Trà Cuôn là đặc sản của Trà Vinh, gắn với ngày Tết và dịp lễ của người miền Tây. Bánh gói bằng nếp, đậu và thịt, hấp lâu cho chín mềm.",
      "tastingTip": "Cắt khoanh vừa ăn, có thể chiên sơ cho thơm. Ăn cùng dưa món hoặc củ kiệu. Bảo quản nơi mát, dùng trong thời hạn khuyến nghị.",
      "address": "QL53, Ấp Trà Cuôn, Vinh Kim, Vĩnh Long"
    },
    "3": {
      "cultureStory": "Duyên Hải là vùng ven biển với nhiều loại hải sản nhỏ, được chế biến bằng cách rang me chua ngọt, dân dã. Món thường là món nhậu hoặc ăn vặt buổi tối.",
      "tastingTip": "Ăn nóng để sốt me bám đều. Chấm bánh mì vào sốt me. Gọi kèm rau sống hoặc trà đá cho cân vị.",
      "address": "Khóm Phước Trị, phường 1, TX Duyên Hải, Vĩnh Long"
    }
  },
  "vinhlong": {
    "0": {
      "cultureStory": "Phở kho là biến tấu ăn theo kiểu kho, thịt mềm thấm vị, thay vì chan nước dùng. Món phù hợp cho người thích vị đậm và ít nước.",
      "tastingTip": "Trộn đều sợi phở với phần kho. Ăn cùng rau sống hoặc đồ chua. Nêm thêm ớt hoặc tương nếu thích.",
      "address": "24/6r Mậu Thân 2, Phước Hậu, Vĩnh Long"
    },
    "1": {
      "cultureStory": "Tôm càng xanh là đặc sản nước ngọt của miền Tây, thịt chắc, ngọt và nhiều gạch. Tôm nướng giữ nguyên vị ngọt tự nhiên, thường ăn chấm muối ớt xanh hoặc muối tiêu chanh.",
      "tastingTip": "Ăn nóng để thịt tôm còn giòn ngọt. Chấm muối ớt xanh hoặc muối tiêu chanh. Hỏi giá theo ký trước khi gọi.",
      "address": "Ấp Thành Hóa 1, Tân Thành Bình, Vĩnh Long 930000"
    },
    "2": {
      "cultureStory": "Bánh tráng là nguyên liệu gần gũi của miền Tây, dùng để cuốn nem, thịt nướng và rau sống. Nghề làm bánh tráng gắn với nhiều làng nghề truyền thống ở Nam Bộ.",
      "tastingTip": "Cuốn với rau sống và nem nướng khi còn nóng. Chấm nước chấm đậm vị. Mua làm quà nên chọn nơi có nhãn mác rõ ràng.",
      "address": "85 Đ. 2 Tháng 9, Long Châu, Vĩnh Long"
    },
    "3": {
      "cultureStory": "Gà nòi là giống gà thịt chắc, ngọt, thường dùng trong các món lẩu, nướng và hấp ở miền Tây. Lẩu gà nòi nấu cùng lá giang hoặc lá é, thơm vị quê.",
      "tastingTip": "Nhúng rau sau khi thịt gà đã chín để nước ngọt hơn. Chấm muối tiêu chanh hoặc nước mắm gừng. Ăn cùng bún hoặc mì để cân vị."
    }
  },
  "danang": {
    "0": {
      "address": "113/3 Nguyễn Chí Thanh, Hải Châu (bún chả cá Bà Hờn)",
      "cultureStory": "Bún chả cá Đà Nẵng gói vị biển trong tô nước dùng nấu từ xương cá, cà chua, thơm và bí đỏ. Chả cá dai thơm, vị chua ngọt nhẹ khiến món ăn quen thuộc này hợp cả bữa sáng lẫn những ngày phố biển trở gió.",
      "tastingTip": "Nếm nước dùng trước, rồi thêm chanh, ớt và hành ngâm theo khẩu vị. Ăn cùng rau sống để vị cá và vị thanh của nước dùng rõ hơn."
    },
    "1": {
      "address": "95 Nguyễn Tri Phương, Thanh Khê (mì Quảng Bà Mua)",
      "cultureStory": "Mì Quảng mang tinh thần bữa ăn xứ Quảng: nguyên liệu tươi, rau sống phong phú và nước nhưn chỉ chan vừa đủ. Sợi mì vàng, tôm thịt, đậu phộng và bánh tráng tạo nên nhiều lớp giòn, mềm, béo và thơm trong cùng một tô.",
      "tastingTip": "Bẻ bánh tráng nướng vào tô, trộn mì với phần nước nhưn sánh rồi ăn kèm rau sống và hoa chuối. Đừng chan thêm quá nhiều nước để giữ đúng kiểu mì ít nước."
    },
    "2": {
      "address": "Khu ẩm thực Chợ Cồn, đường Ông Ích Khiêm, Hải Châu",
      "cultureStory": "Bánh tráng cuốn thịt heo là món ăn đề cao sự cân bằng: thịt luộc mềm béo, rau sống nhiều vị và mắm nêm đậm đà được gói trong lớp bánh tráng dai. Mâm cuốn nhiều thành phần cũng gợi nét quây quần, thong thả trong bữa ăn miền Trung.",
      "tastingTip": "Xếp rau, dưa leo và lát thịt vào bánh tráng, cuốn vừa tay rồi chấm mắm nêm. Nếu chưa quen mắm nêm, thử từng ít một và thêm thơm hoặc ớt để chỉnh vị."
    },
    "3": {
      "address": "Khu phố biển Mỹ Khê, đường Võ Nguyên Giáp, Sơn Trà",
      "cultureStory": "Bữa hải sản ven biển gắn với nhịp sống của một đô thị hướng ra biển, nơi nguyên liệu tươi thường được chế biến đơn giản để giữ vị ngọt tự nhiên. Một bàn ăn nhiều món cũng là dịp chia sẻ và thử nhiều loại hải sản địa phương.",
      "tastingTip": "Ưu tiên món hấp hoặc nướng để cảm nhận độ tươi; hỏi giá theo phần hoặc theo cân trước khi gọi. Ăn kèm rau, muối ớt xanh và chanh để vị hải sản không bị lấn át."
    }
  },
  "quangngai": {
    "0": {
      "address": "Khu trung tâm TP. Quảng Ngãi, quanh chợ Nghĩa Lộ",
      "cultureStory": "Bún don là món ăn mộc mạc của vùng sông nước Quảng Ngãi, lấy vị ngọt tự nhiên từ don nhỏ sống ở vùng nước lợ làm điểm nhấn. Nước dùng thanh, hành và tiêu thơm khiến tô bún giản dị mà khó quên.",
      "tastingTip": "Nếm nước dùng trước khi thêm ớt; ăn nóng cùng rau sống và bánh tráng nướng nếu quán có phục vụ. Don có thể lẫn cát tự nhiên, nên nhẩn nha thưởng thức từng thìa."
    },
    "1": {
      "address": "Khu trung tâm TP. Quảng Ngãi, gần sông Trà Khúc",
      "cultureStory": "Cá bống sông Trà được kho liu riu cùng tiêu, nước mắm và gia vị đến khi thấm vị, thịt săn mà vẫn mềm. Món ăn gợi bữa cơm nhà miền Trung, nơi một niêu cá đậm đà có thể ăn cùng cơm nóng rất giản dị.",
      "tastingTip": "Gắp cá ăn cùng cơm trắng và rau luộc để cân vị mặn ngọt. Nếm trước khi chan nước kho vì món thường được nêm đậm để ăn kèm cơm."
    },
    "2": {
      "address": "Các lò bánh và quầy đặc sản khu trung tâm TP. Quảng Ngãi",
      "cultureStory": "Kẹo gương có lớp đường trong và giòn như mặt gương, điểm lạc rang và mè thơm bùi. Món quà nhỏ này thể hiện cách người Quảng Ngãi biến những nguyên liệu quen thuộc thành thức quà thanh nhẹ, tiện mang theo.",
      "tastingTip": "Bẻ miếng nhỏ để cảm nhận độ giòn và vị bùi của lạc mè. Khi mua làm quà, chọn gói kín, khô ráo để kẹo giữ được độ giòn."
    },
    "3": {
      "address": "Khu trung tâm TP. Quảng Ngãi, quanh chợ Quảng Ngãi",
      "cultureStory": "Bún cá thu dựa vào vị ngọt của cá biển và nước dùng nấu thanh, ăn cùng bún, rau thơm và chút hành. Đây là kiểu món nước ven biển chú trọng nguyên liệu tươi và cách nêm vừa phải.",
      "tastingTip": "Thêm chanh và ớt sau khi đã nếm nước dùng. Ăn kèm rau sống, đừng khuấy mạnh để miếng cá giữ nguyên thớ."
    }
  },
  "binhdinh": {
    "0": {
      "address": "Khu đầm Châu Trúc, xã Mỹ Châu, huyện Phù Mỹ",
      "cultureStory": "Bún tôm Châu Trúc nổi bật bởi tôm đất tươi được giã hoặc xay tại chỗ, nấu lên tạo vị ngọt đậm mà không cần nhiều gia vị. Món ăn gắn với nguồn thủy sản đầm nước lợ và nhịp sống bình dị của vùng Phù Mỹ.",
      "tastingTip": "Ăn ngay khi tô vừa dọn để cảm nhận mùi tôm mới nấu. Thêm hành, tiêu hoặc ớt vừa đủ; nếm nước trước khi nêm thêm nước mắm."
    },
    "1": {
      "address": "Khu phố ẩm thực Ngô Văn Sở, trung tâm Quy Nhơn",
      "cultureStory": "Bánh hỏi được làm từ bột gạo thành những sợi mảnh đan đều, thường ăn cùng lòng heo và cháo nóng. Sự kết hợp tưởng đơn sơ này tạo nên bữa sáng đủ vị, đậm đà và rất quen thuộc với người Bình Định.",
      "tastingTip": "Phết chút dầu hẹ lên bánh hỏi, ăn cùng lòng và rau thơm rồi chấm nước mắm. Húp một thìa cháo nóng giữa các miếng để làm dịu vị đậm."
    },
    "2": {
      "address": "Khu phố ẩm thực Ngô Văn Sở, trung tâm Quy Nhơn",
      "cultureStory": "Bánh xèo tôm nhảy có lớp vỏ mỏng giòn, bên trong là tôm tươi vừa chuyển màu trên chảo nóng. Tên gọi vui tai gợi hình ảnh tôm còn tươi bật mình khi gặp nhiệt, tạo nên nét duyên riêng của món ăn xứ biển.",
      "tastingTip": "Ăn lúc bánh vừa ra chảo để giữ độ giòn; cuốn với rau sống và bánh tráng rồi chấm nước mắm chua ngọt. Gói nhỏ để vỏ bánh không nhanh mềm."
    },
    "3": {
      "address": "Khu Ghềnh Ráng – Quy Hòa, phía nam trung tâm Quy Nhơn",
      "cultureStory": "Gà chỉ là cách gọi dân dã cho kiểu quán để khách chọn gà còn sống trước khi chế biến. Bữa ăn thường có gà nướng hoặc hấp, ăn cùng rau và món phụ, tạo không khí thoải mái của những buổi tụ họp ở vùng ngoại ô Quy Nhơn.",
      "tastingTip": "Hỏi rõ trọng lượng và giá trước khi chọn gà, đồng thời thống nhất cách chế biến. Chấm muối tiêu chanh hoặc muối ớt, ăn kèm rau và cơm lam nếu có."
    }
  },
  "phuyen": {
    "0": {
      "address": "Khu trung tâm Tuy Hòa, quanh công viên Nguyễn Huệ",
      "cultureStory": "Bánh canh hẹ Tuy Hòa có sợi bột gạo mềm, chả cá biển và lớp hẹ xanh phủ kín mặt tô. Nước dùng nấu từ cá có vị ngọt thanh, làm nổi bật nguyên liệu biển quen thuộc của xứ Nẫu.",
      "tastingTip": "Thử nước dùng trước, rồi thêm ớt và chanh tùy thích. Hẹ được cho nhiều là nét riêng của món; trộn nhẹ để hương hẹ lan đều mà chả cá không vỡ."
    },
    "1": {
      "address": "Khu trung tâm Tuy Hòa, quanh chợ Tuy Hòa",
      "cultureStory": "Cơm gà Phú Yên kết hợp cơm nấu thơm với thịt gà xé hoặc chặt miếng, rau răm và đồ chua. Cách nêm đậm vừa phải cùng nguyên liệu địa phương làm nên một bữa ăn giản dị, chắc bụng của vùng duyên hải.",
      "tastingTip": "Ăn cùng rau răm, đồ chua và nước mắm gừng hoặc nước sốt của quán. Nếu gọi gà xé, trộn nhẹ để gia vị thấm đều mà thịt vẫn tơi."
    },
    "2": {
      "address": "Khu trung tâm Tuy Hòa, quanh chợ Tuy Hòa",
      "cultureStory": "Bánh căn mực được đổ trong khuôn đất nhỏ, mặt bánh xém nhẹ còn phần ruột mềm, ăn cùng mực tươi và nước chấm. Món ăn vặt giản dị này hợp với nhịp phố biển, nơi hải sản được đưa thẳng vào những món ăn thường ngày.",
      "tastingTip": "Ăn khi bánh còn nóng để cảm nhận viền giòn và mực ngọt. Chấm ít nước mắm trước, sau đó thêm xoài bào hoặc rau sống nếu quán dọn kèm."
    },
    "3": {
      "address": "Khu ẩm thực trung tâm Tuy Hòa, quanh đường Lê Duẩn",
      "cultureStory": "Mắt cá ngừ đại dương được hầm cùng thuốc bắc và gia vị, biến phần nguyên liệu ít dùng thành món đặc sản nổi tiếng của Tuy Hòa. Món ăn phản ánh nghề khai thác cá ngừ và cách tận dụng trọn vẹn sản vật biển.",
      "tastingTip": "Dùng nóng, múc từng phần nhỏ và nếm nước hầm trước vì vị thuốc bắc khá rõ. Nếu lần đầu thử, chia một phần để ăn cùng rau hoặc bánh mì cho cân vị béo."
    }
  },
  "khanhhoa": {
    "0": {
      "address": "Khu trung tâm Nha Trang, quanh chợ Xóm Mới",
      "cultureStory": "Bún sứa kết hợp sứa giòn với chả cá và nước dùng trong, thanh vị. Món ăn gợi nguồn hải sản phong phú của vịnh Nha Trang, đồng thời cho thấy cách chế biến nhẹ nhàng để vị biển vẫn nổi bật.",
      "tastingTip": "Ăn lúc nóng, thêm rau sống, chanh và ớt sau khi nếm nước dùng. Sứa ngon thường giòn mát; nhai chậm để cảm nhận độ giòn khác với chả cá mềm."
    },
    "1": {
      "address": "Khu trung tâm Ninh Hòa, Khánh Hòa",
      "cultureStory": "Bún lá cá dầm là món ăn tiêu biểu của Ninh Hòa: bún được cuộn thành lá nhỏ, dùng cùng cá dầm và nước dùng nóng. Món ăn gắn với nghề làm bún địa phương và nguồn cá biển, có vị thanh mà vẫn đậm đà.",
      "tastingTip": "Gỡ từng cuộn bún vào tô, ăn cùng cá và rau thơm. Nêm chanh, ớt từng chút để giữ vị ngọt tự nhiên của nước dùng và cá."
    },
    "2": {
      "address": "Khu trung tâm Ninh Hòa, Khánh Hòa",
      "cultureStory": "Nem Ninh Hòa có hai cách thưởng thức quen thuộc: nem nướng ăn tại chỗ và nem chua lên men làm quà. Nem nướng thơm mùi than, thường đi cùng rau sống, bánh tráng và nước chấm sánh.",
      "tastingTip": "Cuốn nem với rau, dưa leo và bánh tráng rồi chấm nước sốt. Thử cuốn nhỏ trước để điều chỉnh lượng sốt, vì nước chấm thường có vị đậm và ngọt."
    },
    "3": {
      "address": "Khu Tháp Bà – Xóm Bóng, Nha Trang",
      "cultureStory": "Hải sản nướng ở Nha Trang thường được chế biến nhanh trên than hoặc bếp nóng để giữ độ ngọt của nguyên liệu biển. Khu Tháp Bà – Xóm Bóng cũng là nơi dễ kết hợp bữa ăn với không khí ven sông và đời sống địa phương.",
      "tastingTip": "Hỏi giá theo cân và xác nhận cách tính trước khi gọi. Chọn hấp hoặc nướng đơn giản cho hải sản tươi, dùng muối ớt xanh và chanh vừa đủ."
    }
  },
  "ninhthuan": {
    "0": {
      "address": "Khu trung tâm Phan Rang – Tháp Chàm, quanh chợ Phan Rang",
      "cultureStory": "Bánh canh chả cá Phan Rang dùng sợi bánh canh mềm dai với chả cá và nước dùng có vị ngọt của cá biển. Món ăn bình dị nhưng đậm chất duyên hải, thường được chọn cho bữa sáng hoặc bữa xế.",
      "tastingTip": "Nếm nước dùng trước khi thêm ớt; ăn cùng chả cá và rau thơm khi còn nóng. Có thể vắt chút chanh để làm vị cá thanh hơn."
    },
    "1": {
      "address": "Khu trung tâm Phan Rang – Tháp Chàm, quanh chợ Phan Rang",
      "cultureStory": "Cơm gà Phan Rang thường dùng gà ta thịt chắc và cơm nấu vàng thơm, ăn kèm rau răm, đồ chua cùng nước chấm. Mỗi thành phần được giữ vị riêng nhưng hòa lại thành bữa ăn đậm đà của phố nắng.",
      "tastingTip": "Ăn kèm rau răm và đồ chua để cân vị béo của gà. Thử nước chấm riêng trước khi rưới lên cơm để điều chỉnh độ đậm theo ý thích."
    },
    "2": {
      "address": "Khu phố ăn uống trung tâm Phan Rang, quanh đường Thống Nhất",
      "cultureStory": "Bánh căn và bánh xèo Phan Rang được đổ nóng trên khuôn, phần nhân thường có trứng hoặc hải sản. Món ăn được dùng cùng rau sống, xoài xanh và nhiều loại nước chấm, tạo nên trải nghiệm vừa giòn vừa chua cay.",
      "tastingTip": "Ăn bánh ngay khi vừa ra khuôn. Thử từng loại nước chấm riêng — mắm nêm, nước mắm hoặc mắm đậu — vì mỗi loại làm nổi bật một vị khác nhau."
    },
    "3": {
      "address": "Khu ven biển Ninh Chữ và trung tâm Phan Rang – Tháp Chàm",
      "cultureStory": "Gỏi cá mai mang vị chua thơm của cá biển trộn thính và rau, còn thịt cừu nướng phản ánh vùng đất nắng gió với những đàn cừu chăn thả. Hai món tạo nên cặp vị tươi mát và đậm đà đặc trưng của Ninh Thuận.",
      "tastingTip": "Cuốn gỏi cá với rau và bánh tráng rồi chấm nước sốt của quán. Với thịt cừu, ăn lúc nóng cùng rau nướng; hỏi rõ phần ăn và cách tẩm ướp trước khi gọi."
    }
  },
  "binhthuan": {
    "0": {
      "address": "Khu chợ Phan Thiết và các quầy hàng trung tâm",
      "cultureStory": "Bánh quai vạc có lớp bột trong dai ôm nhân tôm thịt, ăn cùng hành phi và nước mắm ngọt cay. Từ món quà vặt ở chợ, bánh trở thành thức ăn tiện tay gắn với nhịp sống phố biển Phan Thiết.",
      "tastingTip": "Rưới nước mắm vừa đủ để bánh không bị ngập, thêm hành phi và ớt nếu thích. Ăn khi còn ấm để lớp bột giữ độ dai mềm."
    },
    "1": {
      "address": "Khu resort và làng chài Mũi Né, TP. Phan Thiết",
      "cultureStory": "Lẩu thả Mũi Né trình bày cá, thịt, rau và các nguyên liệu thành từng phần riêng quanh tô bún, lấy cảm hứng từ cách thả nguyên liệu vào nước dùng. Món ăn kết hợp hải sản địa phương với rau củ tươi, vừa đẹp mắt vừa có nhiều lớp vị.",
      "tastingTip": "Thử một ít nguyên liệu khô cùng nước chấm trước, sau đó chan nước dùng nóng theo cách quán hướng dẫn. Ăn từng phần nhỏ để cảm nhận rõ vị cá, rau và nước chấm."
    },
    "2": {
      "address": "Khu ẩm thực đường Tuyên Quang, trung tâm Phan Thiết",
      "cultureStory": "Bánh xèo Phan Thiết có vỏ mỏng, nhân tôm thịt hoặc hải sản và thường được ăn theo kiểu cuốn rau. Những chiếc bánh nhỏ ra liên tục từ khuôn nóng khiến món ăn trở thành lựa chọn thân thuộc cho buổi chiều phố biển.",
      "tastingTip": "Ăn lúc bánh vừa đổ để giữ viền giòn; cuốn cùng rau và chấm nước mắm pha. Chấm vừa tay để bánh không mất độ giòn."
    },
    "3": {
      "address": "Khu Mũi Né – Hòn Rơm, TP. Phan Thiết",
      "cultureStory": "Dông cát là loài bò sát sống ở vùng đồi cát ven biển, thường được chế biến nướng để giữ thớ thịt săn và vị ngọt nhẹ. Món ăn mang nét riêng của cảnh quan cát nắng Bình Thuận và thường xuất hiện trong thực đơn địa phương.",
      "tastingTip": "Ăn khi còn nóng, cuốn với rau thơm và bánh tráng nếu quán phục vụ. Hỏi rõ khẩu phần và giá trước khi gọi vì món thường tính theo phần hoặc theo con."
    }
  },
  "daknong": {
    "0": {
      "address": "Khu trung tâm Gia Nghĩa, quanh chợ Gia Nghĩa",
      "cultureStory": "Phở cuốn là lựa chọn nhẹ nhàng giữa hành trình khám phá cao nguyên, với bánh phở mềm cuốn thịt và rau thơm. Món ăn không phải đặc sản riêng của Đắk Nông, nhưng hợp làm điểm dừng đổi vị trước những món đậm chất núi rừng.",
      "tastingTip": "Ăn từng cuốn khi bánh còn mềm, chấm nước mắm chua ngọt hoặc tương theo cách quán dọn. Gọi phần vừa đủ để dành bụng cho các món địa phương khác."
    },
    "1": {
      "address": "Khu trung tâm Gia Nghĩa, dọc các tuyến ăn uống nội đô",
      "cultureStory": "Cá lăng thịt chắc, ít xương dăm, thường được nấu lẩu cùng măng chua và rau. Nồi lẩu nóng hợp với khí hậu cao nguyên và tinh thần bữa ăn quây quần sau một ngày đi đường.",
      "tastingTip": "Đợi nước lẩu sôi lại rồi mới nhúng rau và cá để giữ độ ngọt. Ăn cùng bún, nêm thêm ớt hoặc chanh tùy khẩu vị."
    },
    "2": {
      "address": "Khu ăn vặt trung tâm Gia Nghĩa",
      "cultureStory": "Bánh tráng nướng là món ăn vặt phổ biến ở nhiều vùng, được nướng trên than đến khi mặt bánh thơm giòn và phần nhân nóng đều. Đây là điểm dừng nhẹ giữa hành trình, bên cạnh những món đặc sản cao nguyên.",
      "tastingTip": "Ăn ngay khi bánh vừa nướng để giữ độ giòn. Nếu có nhiều loại nhân, chọn nhân đơn giản trước để bánh không quá ngấy."
    },
    "3": {
      "address": "Khu vực các buôn làng và điểm ẩm thực bản địa tại Đắk Nông; nên hỏi nơi phục vụ trước khi đi",
      "cultureStory": "Đọt mây có vị đắng nhẹ và thường được chế biến cùng gia vị, phản ánh cách cư dân Tây Nguyên tận dụng sản vật rừng theo mùa. Món ăn lạ miệng, mang hương vị bản địa khác với những món phổ thông ở phố.",
      "tastingTip": "Thử một miếng nhỏ trước vì vị đắng là nét đặc trưng. Hỏi người chế biến về cách làm và thành phần đi kèm; món này không phải lúc nào cũng có sẵn ở khu trung tâm."
    }
  },
  "kontum": {
    "0": {
      "address": "Khu trung tâm TP. Kon Tum, quanh chợ Kon Tum",
      "cultureStory": "Bún nước Kon Tum có nước dùng tôm thịt giã nhuyễn, tạo vị ngọt đậm và thơm hơn kiểu bún nước trong. Món ăn bình dân này thường được người địa phương chọn cho bữa sáng, ăn nóng giữa tiết trời cao nguyên.",
      "tastingTip": "Nếm nước dùng trước, rồi thêm ớt giã theo khẩu vị. Ăn cùng rau sống và trộn nhẹ để phần tôm thịt hòa đều trong tô."
    },
    "1": {
      "address": "Khu trung tâm TP. Kon Tum, quanh chợ Kon Tum",
      "cultureStory": "Gỏi lá Kon Tum bày nhiều loại lá rừng và rau thơm cùng thịt, tôm, bánh tráng và chén nước chấm sánh. Cách cuốn từng chiếc phễu nhỏ biến bữa ăn thành trải nghiệm khám phá hương lá, vị chát, thơm và cay của vùng cao.",
      "tastingTip": "Chọn vài loại lá dễ ăn làm lớp ngoài, thêm nhân và một ít nước chấm rồi cuốn thành phễu nhỏ. Nếm thử nước chấm trước vì đây là phần quyết định độ đậm của miếng cuốn."
    },
    "2": {
      "address": "Khu trung tâm TP. Kon Tum, quanh chợ Kon Tum",
      "cultureStory": "Xôi măng ghép nếp dẻo với măng rừng xào đậm vị, tạo món ăn no bụng từ những nguyên liệu quen thuộc của miền núi. Vị chua nhẹ hoặc giòn của măng làm phần xôi bớt ngấy.",
      "tastingTip": "Ăn một miếng xôi cùng măng để cảm nhận độ dẻo và vị đậm cân bằng. Có thể thêm hành phi hoặc tép khô nếu quán có phục vụ."
    },
    "3": {
      "address": "Khu du lịch Măng Đen, xã Măng Đen, tỉnh Quảng Ngãi (Kon Tum cũ)",
      "cultureStory": "Cá tầm nuôi ở vùng khí hậu mát Măng Đen thường được chế biến nướng hoặc nấu lẩu, thịt chắc và ít xương. Bữa ăn nóng giữa rừng thông và không khí se lạnh là một phần trải nghiệm ẩm thực cao nguyên.",
      "tastingTip": "Ăn cá khi còn nóng cùng rau địa phương; nếu gọi lẩu, chờ nước sôi rồi mới cho rau để giữ độ tươi. Hỏi rõ giá theo cân trước khi chọn cá."
    }
  },
  "lamdong": {
    "0": {
      "address": "Khu Hòa Bình – chợ Đà Lạt, trung tâm Đà Lạt",
      "cultureStory": "Bánh mì xíu mại Đà Lạt là bữa sáng giản dị với viên thịt nóng trong chén nước dùng, ăn cùng bánh mì giòn. Cách phục vụ riêng phần xíu mại giúp thực khách vừa chấm bánh vừa nhâm nhi nước dùng giữa buổi sớm se lạnh.",
      "tastingTip": "Xé bánh mì thành miếng vừa ăn rồi chấm vào nước xíu mại nóng. Thêm sa tế hoặc hành ngò từ từ để không lấn vị ngọt của nước dùng."
    },
    "1": {
      "address": "Khu Ba Toa, phường 1, trung tâm Đà Lạt",
      "cultureStory": "Lẩu bò Ba Toa nổi tiếng với nồi nước dùng đậm đà, nhiều phần thịt và gân bò, thường được ăn trong những buổi tụ họp. Hơi nóng của nồi lẩu hợp với khí trời mát lạnh đặc trưng của Đà Lạt.",
      "tastingTip": "Nhúng rau và mì khi nước sôi nhẹ để rau giữ độ tươi. Gọi lượng thịt vừa đủ cho nhóm và nếm nước lẩu trước khi thêm sa tế."
    },
    "2": {
      "address": "Chợ Đà Lạt và khu chợ đêm đường Nguyễn Thị Minh Khai",
      "cultureStory": "Bánh tráng nướng Đà Lạt thường được nướng trực tiếp trên than, phủ trứng, hành và các loại nhân mặn. Cùng một ly sữa đậu nành nóng, món ăn vặt này gắn với những buổi tối dạo chợ trong khí hậu lạnh.",
      "tastingTip": "Ăn khi bánh vừa nướng để lớp vỏ còn giòn; gọi thêm sữa đậu nành nóng nếu trời lạnh. Chia sẻ một bánh cho hai người nếu còn muốn thử nhiều món chợ đêm."
    },
    "3": {
      "address": "Đường 3 Tháng 4, khu vực cửa ngõ vào trung tâm Đà Lạt",
      "cultureStory": "Lẩu gà lá é kết hợp gà nấu nóng với lá é thơm the, vị chua nhẹ từ măng hoặc gia vị của từng quán. Món ăn miền cao nguyên này thường được thưởng thức theo nồi, phù hợp những buổi tối Đà Lạt se lạnh.",
      "tastingTip": "Cho lá é vào nồi từng ít một và ăn ngay khi vừa tái để giữ mùi thơm. Nếm nước lẩu trước khi thêm ớt; dùng kèm bún hoặc mì tùy quán."
    }
  }
} ;
