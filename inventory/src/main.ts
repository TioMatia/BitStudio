import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { InventoryService } from './inventory/inventory.service'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
    },
  });

  app.useGlobalPipes(new ValidationPipe());

  const inventoryService = app.get(InventoryService);

  const productosPorTienda = [
    {
      storeId: 1,
      items: [
        { name: 'Pan batido', price: 500, quantity: 100, image: 'https://cloudfront-us-east-1.images.arcpublishing.com/palco/UJLZPHQYOJFCNJTOLSXBY4UUFY.png' },
        { name: 'Pan integral', price: 700, quantity: 80, image: 'https://easyways.cl/storage/20210324132429pan-integral.jpg' },
        { name: 'Hallulla', price: 600, quantity: 90, image: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Chilean_bread_%282%29.jpg' },
        { name: 'Pan ciabatta', price: 500, quantity: 110, image: 'https://i.blogs.es/977907/pan-ciabatta-o-chapata/1366_2000.jpg' },
        { name: 'Pan de ajo', price: 800, quantity: 70, image: 'https://i.blogs.es/8e3bfe/pan_ajo/840_560.jpg' },
        { name: 'Pan baguette', price: 800, quantity: 70, image: 'https://easyways.cl/storage/20210414154626baguette-rapido.jpg' },
      ],
    },
    {
      storeId: 2,
      items: [
        { name: 'Helado de chocolate', price: 1200, quantity: 50, image: 'https://cdn.recetasderechupete.com/wp-content/uploads/2019/07/shutterstock_1010248351.jpg' },
        { name: 'Helado de vainilla', price: 1100, quantity: 60, image: 'https://www.gourmet.cl/wp-content/uploads/2016/09/Helado_Vainilla-web-553x458.jpg' },
        { name: 'Helado de frutilla', price: 1150, quantity: 55, image: 'https://www.gourmet.cl/wp-content/uploads/2016/09/Helado-Frutilla-iStock-1-570x432.jpg' },
        { name: 'Helado mixto', price: 1300, quantity: 45, image: 'https://media.istockphoto.com/id/509681368/es/foto/3-de-las-cucharas-de-helado.jpg?s=612x612&w=0&k=20&c=mSYtB8fB7GncuIWZ1gfLc7rwsNK9iATtRSgxXSmQWkk=' },
        { name: 'Barquillo con toppings', price: 1500, quantity: 40, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuPPzR295scn17xuA9D5_d91C2JpSBWmIkxw&s' },
        { name: 'Helado de pistacho', price: 1200, quantity: 40, image: 'https://thermomix-barcelona-sagrada-familia.es/media/Posts/attachments/e11509e4a35add4b68cc010d73eb5070.jpg' },
      ],
    },
    {
      storeId: 3,
      items: [
        { name: 'Torta selva negra', price: 5000, quantity: 10, image: 'https://www.recetasnestle.cl/sites/default/files/styles/recipe_detail_desktop_new/public/srh_recipes/797bcc63bf54837e035b42a9936598d2.jpg?itok=drpzOpbl' },
        { name: 'Cheesecake', price: 4500, quantity: 12, image: 'https://www.paulinacocina.net/wp-content/uploads/2025/01/receta-de-cheesecake-1742898428.jpg' },
        { name: 'Kuchen de manzana', price: 4000, quantity: 15, image: 'https://i.pinimg.com/474x/63/72/85/63728592c27ed423074b0dd90f5c6ee8.jpg' },
        { name: 'Cupcakes variados', price: 3000, quantity: 20, image: 'https://www.bettycrocker.lat/mx/wp-content/uploads/sites/2/2020/12/BCmexico-recipe-cupcakes-de-arcoiris.png' },
        { name: 'Brownies', price: 3500, quantity: 18, image: 'https://cdn.recetasderechupete.com/wp-content/uploads/2019/11/Brownie.jpg' },
        { name: 'Pie de limón', price: 4500, quantity: 18, image: 'https://cdn0.recetasgratis.net/es/posts/4/5/6/pie_de_limon_y_merengue_facil_44654_orig.jpg' },
      ],
    },
    {
      storeId: 4,
      items: [
        { name: 'Arroz 1kg', price: 1200, quantity: 100, image: 'https://www.prisur.cl/media/cache/attachment/filter/product_gallery_main/b6b1adc76b36bd6a7f81344215e93277/245246/6706d4289fa4a143389726.png' },
        { name: 'Leche entera', price: 1000, quantity: 90, image: 'https://santaisabel.vtexassets.com/arquivos/ids/295371/Leche-entera-1-L.jpg?v=638240207839630000' },
        { name: 'Aceite vegetal', price: 2000, quantity: 80, image: 'https://santaisabel.vtexassets.com/arquivos/ids/197658/Aceite-vegetal-1-L.jpg?v=637891751851200000' },
        { name: 'Fideos tallarines', price: 800, quantity: 110, image: 'https://unimarc.vtexassets.com/arquivos/ids/233526/000000000000006526-UN-01.jpg?v=638205421090100000' },
        { name: 'Sal fina', price: 500, quantity: 150, image: 'https://www.spl-latam.com/wp-content/uploads/sites/2/2020/04/Lobos-Bolsa-SalFina-700px-700x700.png' },
        { name: 'Azucar', price: 500, quantity: 150, image: 'https://www.prisa.cl/media/cache/attachment/filter/product_gallery_main/b6b1adc76b36bd6a7f81344215e93277/214700/66468086b4d10487403596.jpg' },
      ],
    },
    {
      storeId: 5,
      items: [
        { name: 'Galletas surtidas', price: 700, quantity: 100, image: 'https://santaisabel.vtexassets.com/arquivos/ids/156467/Galletas-surtidas-400-g.jpg?v=637469295102800000' },
        { name: 'Chicles', price: 300, quantity: 200, image: 'https://cdnx.jumpseller.com/importadoramagu/image/42243143/Bubbaloo_Tutti_Frutti_.jpeg?1700229593' },
        { name: 'Bebida 350ml', price: 900, quantity: 90, image: 'https://santaisabel.vtexassets.com/arquivos/ids/377303/Bebida-Coca-Cola-Original-lata-350-ml.jpg?v=638520760530470000' },
        { name: 'Chocolate', price: 1000, quantity: 80, image: 'https://tofuu.getjusto.com/orioneat-local/resized2/wsw6uyHfuJauA2RZj-1000-x.webp' },
        { name: 'Periodico del día', price: 1200, quantity: 70, image: 'https://www.reddeperiodistas.com/wp-content/uploads/2024/03/prensa-iberica-cierra-el-periodico-de-espana-en-version-papel.jpg' },
        { name: 'Cigarros', price: 5000, quantity: 70, image: 'https://dojiw2m9tvv09.cloudfront.net/41056/product/belmont204732.jpg' },
      ],
    },
    {
      storeId: 6,
      items: [
        { name: 'Pizza italiana', price: 10000, quantity: 10, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9DnZSWlui2FouySCDacypG9L4DwnEFBvgug&s' },
        { name: 'Pizza pepperoni', price: 8500, quantity: 12, image: 'https://www.sortirambnens.com/wp-content/uploads/2019/02/pizza-de-peperoni.jpg' },
        { name: 'Pizza vegetariana', price: 8000, quantity: 15, image: 'https://cdn.shopify.com/s/files/1/0191/9978/files/Pizza-Veggie-Supreme-blog.jpg?v=1652775259' },
        { name: 'Pizza 4 estaciones', price: 5000, quantity: 20, image: 'https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480/img/recipe/ras/Assets/5D256C95-CEB8-4BAC-A299-59992B158F22/Derivates/B71ACB34-5587-46D1-9CF5-77643E96F22F.jpg' },
        { name: 'Bebida 1.5L', price: 2000, quantity: 25, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQUHq3IIj1M50FmXj_4aJLvazndHwAKNOIXw&s' },
        { name: 'Palitos de ajo', price: 4000, quantity: 25, image: 'https://ombligoparao.cl/wp-content/uploads/2023/12/Receta-de-Palitos-de-Ajo.jpg' },
      ],
    },
    {
      storeId: 7,
      items: [
        { name: 'Tela algodón', price: 3500, quantity: 30, image: 'https://telasflora.s3.amazonaws.com/wp-content/uploads/2023/10/11101631/APC_3003.jpg' },
        { name: 'Tela lino', price: 4000, quantity: 25, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbCn7046AptaeRossLy07TGaZOOTrWsnzWhg&s' },
        { name: 'Hilo de coser', price: 500, quantity: 100, image: 'https://www.telaschile.cl/wp-content/uploads/2021/03/hilos-de-coser.jpg' },
        { name: 'Agujas', price: 1000, quantity: 60, image: 'https://dojiw2m9tvv09.cloudfront.net/82264/product/set-3-ajugas-extra-grande3475.jpg' },
        { name: 'Botones', price: 300, quantity: 120, image: 'https://costuritas.cl/wp-content/uploads/2022/01/SR-672-25.02.0022.0000-copia.jpg' },
        { name: 'Tela nylon', price: 300, quantity: 120, image: 'https://essengoldparts.com/wp-content/uploads/2024/08/5.1-5.png' },
      ],
    },
    {
      storeId: 8,
      items: [
        { name: 'Mouse gamer', price: 15000, quantity: 15, image: 'https://media.spdigital.cl/thumbnails/products/dlzbcuza_5a4d38a9_thumbnail_512.jpg' },
        { name: 'Teclado mecánico', price: 25000, quantity: 10, image: 'https://cdnx.jumpseller.com/valrod/image/55640989/Teclado-Mec_nico-Gaming-Hyperx-Alloy-RISE-75-Switch-Red-Lineal-Usb-c-LATAM-1.jpg?1729882171' },
        { name: 'Audífonos bluetooth', price: 20000, quantity: 20, image: 'https://media.falabella.com/falabellaCL/121428599_01/w=800,h=800,fit=pad' },
        { name: 'Cable USB-C', price: 5000, quantity: 30, image: 'https://www.belkin.cl/cdn/shop/files/4287d893-4bc5-4059-bae3-9a9fa4d0ea26-100832489_cab003bt0m-blk_boostcharge_usb-c_to_usb-c_gallery_shot_05_web-e087e613-4970-4b5f-82ef-c0409916e574_240edabc-c634-428c-97ca-11cbb0f9a38c.jpg?v=1736446615&width=1500' },
        { name: 'Monitor 24 pulgadas', price: 80000, quantity: 5, image: 'https://assets.pcfactory.cl/public/foto/46125/2_500.jpg?t=1704982826108' },
        { name: 'Carcasa de celular', price: 5000, quantity: 5, image: 'https://i0.wp.com/efas.cl/wp-content/uploads/2024/11/carcasa-para-celular-samsung-galaxy-A06-4g-2024-1.png' },
      ],
    },
    {
      storeId: 9,
      items: [
        { name: 'Libro de matemática', price: 10000, quantity: 20, image: 'https://cdnx.jumpseller.com/libreria-moraleja/image/60807160/IMG_3229.jpeg?1740840925' },
        { name: 'El Principito', price: 9000, quantity: 25, image: 'https://www.antartica.cl/media/catalog/product/9/7/9789878203935_1.jpg?quality=80&bg-color=255,255,255&fit=bounds&height=700&width=700&canvas=700:700' },
        { name: 'Cuaderno universitario', price: 3000, quantity: 60, image: 'https://dimeiggsschl.vtexassets.com/arquivos/ids/155520-800-auto?v=638019017905400000&width=800&height=auto&aspect=true' },
        { name: 'Lápices de colores', price: 2500, quantity: 70, image: 'https://unimarc.vtexassets.com/arquivos/ids/216688/000000000000199037-UN-01.jpg?v=638749872778400000' },
        { name: 'Agenda escolar', price: 4000, quantity: 40, image: 'https://www.halley.cl/productos/16_0.jpg' },
        { name: 'Cartulina', price: 1000, quantity: 40, image: 'https://librery.cl/wp-content/uploads/2021/06/cartulina-espanola.jpg' },
      ],
    },
  ];

for (const tienda of productosPorTienda) {
  for (const producto of tienda.items) {
    const yaExiste = await inventoryService.findByNameAndStoreId(producto.name, tienda.storeId);

    if (!yaExiste) {
      await inventoryService.create({
        ...producto,
        storeId: tienda.storeId,
        description: `Producto de ${producto.name}`,
      });
      console.log(`Producto ${producto.name} agregado a tienda ${tienda.storeId}`);
    } else {
      console.log(`Producto ${producto.name} ya existe en tienda ${tienda.storeId}`);
    }
  }
}

  await app.listen(process.env.PORT ?? 3000);
  console.log('Inventory service seeded con productos por tienda');
}
bootstrap();
