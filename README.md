<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# YAP NestJS Projesi

Bu proje, NestJS ile geliştirilmiş bir proje yönetim platformu API'sidir. Kullanıcı yönetimi, proje, görev ve yorum gibi temel modülleri içerir.

---

## İçindekiler

- [Özellikler](#özellikler)
- [Kurulum](#kurulum)
- [Ortam Değişkenleri](#ortam-değişkenleri)
- [Veritabanı Kurulumu](#veritabanı-kurulumu)
- [Projeyi Başlatma](#projeyi-başlatma)
- [Geliştirme Modu](#geliştirme-modu)
- [Testler](#testler)
- [API Dokümantasyonu (Swagger)](#api-dokümantasyonu-swagger)
- [Online Deployment](#online-deployment)
- [Kullanım Notları](#kullanım-notları)
- [Katkı Sağlama](#katkı-sağlama)

---

## Özellikler

- JWT tabanlı kimlik doğrulama
- Kullanıcı, proje, görev ve yorum yönetimi
- TypeORM ile PostgreSQL desteği
- Swagger ile otomatik API dokümantasyonu
- Kapsamlı unit ve e2e test altyapısı

---

## Kurulum

1. **Depoyu klonla:**
   ```bash
   git clone <repo-url>
   cd yap-nest
   ```

2. **Bağımlılıkları yükle:**
   ```bash
   npm install
   ```

---

## Ortam Değişkenleri

Proje kök dizininde `.env` dosyası bulunmalı. Örnek dosya: `env.example`

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=yap_nest_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Application Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

> **Not:** Geliştirme için `.env` dosyasını `env.example`'dan kopyalayabilirsin:
> ```bash
> cp env.example .env
> ```

---

## Veritabanı Kurulumu

1. PostgreSQL kurulu olmalı.
2. Aşağıdaki komutlarla veritabanını oluşturabilirsin:
   ```sql
   CREATE DATABASE yap_nest_db;
   CREATE USER postgres WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE yap_nest_db TO postgres;
   ```
3. `.env` dosyasındaki veritabanı bilgileri ile eşleştiğinden emin ol.

---

## Projeyi Başlatma

### Geliştirme Modu

```bash
npm run start:dev
```
- Otomatik hot-reload ile geliştirme yapabilirsin.

### Üretim Modu

```bash
npm run build
npm run start:prod
```

### Normal Başlatma

```bash
npm run start
```

---

## Testler

### Unit Testler

```bash
npm test
```

### E2E Testler

```bash
npm run test:e2e
```

### Test Kapsamı

```bash
npm run test:cov
```

---

## API Dokümantasyonu (Swagger)

Uygulama çalışırken aşağıdaki adrese giderek API endpoint'lerini ve dökümantasyonu görebilirsin:

```
http://localhost:3001/api
```

---

## Online Deployment

### Vercel ile Deployment (Önerilen)

#### 1. Vercel CLI ile Hızlı Deployment:

```bash
# Vercel CLI kurulumu
npm i -g vercel

# Proje kök dizininde
vercel

# Veya doğrudan production'a deploy
vercel --prod
```

#### 2. Vercel Dashboard ile Deployment:

1. [vercel.com](https://vercel.com) hesabı oluştur
2. "New Project" → GitHub/GitLab repo'nu bağla
3. Framework Preset: **Node.js** seç
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Install Command: `npm install`

#### 3. Ortam Değişkenleri (Environment Variables):

Vercel Dashboard'da aşağıdaki değişkenleri ekle:

```
DB_HOST=your-database-host
DB_PORT=5432
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_DATABASE=your-database-name
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-domain.com
```

### Veritabanı Seçenekleri:

#### A) Vercel Postgres (En Kolay):
1. Vercel Dashboard → Storage → Create Database
2. PostgreSQL seç
3. Otomatik olarak environment variables eklenir

#### B) Supabase (Ücretsiz):
1. [supabase.com](https://supabase.com) hesabı oluştur
2. Yeni proje oluştur
3. Database URL'yi Vercel environment variables'a ekle

#### C) PlanetScale:
1. [planetscale.com](https://planetscale.com) hesabı oluştur
2. MySQL database oluştur
3. Connection string'i environment variables'a ekle

### Diğer Platformlar:

#### Railway:
```bash
# Railway CLI kurulumu
npm i -g @railway/cli

# Login ve deploy
railway login
railway init
railway up
```

#### Render:
1. [render.com](https://render.com) hesabı oluştur
2. "New Web Service" → GitHub repo bağla
3. Build Command: `npm run build`
4. Start Command: `npm run start:prod`

#### Heroku:
```bash
# Heroku CLI kurulumu
npm install -g heroku

# Login ve deploy
heroku login
heroku create your-app-name
git push heroku main
```

---

## Kullanım Notları

- Varsayılan port: **3001**
- Swagger arayüzü ile API endpoint'lerini kolayca test edebilirsin.
- Geliştirme ortamında veritabanı bağlantısı gereklidir.
- Linter ve format kurallarına uymak için:
  ```bash
  npm run lint
  npm run format
  ```

---

## Katkı Sağlama

1. Fork'la ve yeni bir branch oluştur.
2. Değişikliklerini yap.
3. Testleri çalıştır ve kodunu kontrol et.
4. Pull request gönder.

---

## Lisans

MIT

---
