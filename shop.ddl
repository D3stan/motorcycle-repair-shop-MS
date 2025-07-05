-- *********************************************
-- * SQL MySQL generation                      
-- *--------------------------------------------
-- * DB-MAIN version: 11.0.2              
-- * Generator date: Sep 14 2021              
-- * Generation date: Fri Jul  4 15:20:01 2025 
-- * LUN file: C:\Users\user\Documents\GitHub\motorcycle-repair-shop-MS\ER-Scheme.lun 
-- * Schema: ShopRel/1 
-- ********************************************* 


-- Database Section
-- ________________ 

create database ShopRel;
use ShopRel;


-- Tables Section
-- _____________ 

create table AFFIANCAMENTO (
     CodiceSessione char(1) not null,
     CF char(1) not null,
     constraint IDAFFIANCAMENTO primary key (CF, CodiceSessione));

create table APPARTENENZA (
     CodiceRicambio char(1) not null,
     CodiceModello char(1) not null,
     constraint IDAPPARTENENZA primary key (CodiceRicambio, CodiceModello));

create table FATTURA (
     CodiceFattura char(1) not null,
     Importo char(1) not null,
     Data char(1) not null,
     Note char(1) not null,
     CF char(1) not null,
     CodiceIntervento char(1) not null,
     CodiceSessione char(1) not null,
     constraint IDFATTURA primary key (CodiceFattura));

create table FORNITORE (
     CodiceFornitore char(1) not null,
     Nome char(1) not null,
     Telefono char(1) not null,
     Email char(1) not null,
     constraint IDFORNITORE primary key (CodiceFornitore));

create table INTERVENTO (
     CodiceIntervento char(1) not null,
     DataInizio char(1) not null,
     DataFine char(1) not null,
     KmMoto char(1) not null,
     Tipo char(1) not null,
     Causa char(1),
     OreImpiegate char(1) not null,
     Note char(1) not null,
     Nome char(1) not null,
     NumTelaio char(1) not null,
     constraint IDINTERVENTO_ID primary key (CodiceIntervento));

create table MAGAZZINO (
     CodiceMagazzino char(1) not null,
     constraint IDMAGAZZINO primary key (CodiceMagazzino));

create table MODELLO (
     Marca char(1) not null,
     Nome char(1) not null,
     CodiceModello char(1) not null,
     Cilindrata char(1) not null,
     Segmento char(1) not null,
     Potenza char(1) not null,
     constraint IDMODELLO primary key (CodiceModello));

create table MOTO (
     Targa char(1) not null,
     AnnoImmatricolazione char(1) not null,
     NumTelaio char(1) not null,
     Note char(1) not null,
     CodiceModello char(1) not null,
     CF char(1) not null,
     constraint IDMOTO primary key (NumTelaio));

create table PERSONA (
     Nome char(1) not null,
     Cognome char(1) not null,
     CF char(1) not null,
     Cellulare char(1) not null,
     Email char(1) not null,
     Tipo char(1) not null,
     constraint IDPERSONA primary key (CF));

create table PRENOTAZIONE (
     CodicePrenotazione char(1) not null,
     DataPrenotazione char(1) not null,
     Descrizione char(1) not null,
     CF char(1) not null,
     constraint IDPRENOTAZIONE primary key (CodicePrenotazione));

create table RICAMBIO (
     Marca char(1) not null,
     Nome char(1) not null,
     Descrizione char(1),
     CodiceRicambio char(1) not null,
     PrezzoFornitore char(1) not null,
     CodiceFornitore char(1) not null,
     constraint IDRICAMBIO_ID primary key (CodiceRicambio));

create table SESSIONE (
     CodiceSessione char(1) not null,
     DataInizio char(1) not null,
     OreImpiegate char(1) not null,
     Note char(1) not null,
     NumTelaio char(1) not null,
     constraint IDSESSIONE_ID primary key (CodiceSessione));

create table STATO (
     Nome char(1) not null,
     Descrizione char(1) not null,
     Colore char(1) not null,
     constraint IDSTATO primary key (Nome));

create table STOCCAGGIO (
     CodiceRicambio char(1) not null,
     CodiceMagazzino char(1) not null,
     constraint IDSTOCCAGGIO primary key (CodiceMagazzino, CodiceRicambio));

create table SVOLGIMENTO (
     CodiceIntervento char(1) not null,
     CF char(1) not null,
     constraint IDSVOLGIMENTO primary key (CF, CodiceIntervento));

create table UTILIZZO (
     CodiceRicambio char(1) not null,
     CodiceIntervento char(1) not null,
     Quantita char(1) not null,
     Prezzo char(1) not null,
     constraint IDUTILIZZO primary key (CodiceRicambio, CodiceIntervento));


-- Constraints Section
-- ___________________ 

alter table AFFIANCAMENTO add constraint FKAFF_PER
     foreign key (CF)
     references PERSONA (CF);

alter table AFFIANCAMENTO add constraint FKAFF_SES
     foreign key (CodiceSessione)
     references SESSIONE (CodiceSessione);

alter table APPARTENENZA add constraint FKAPP_MOD
     foreign key (CodiceModello)
     references MODELLO (CodiceModello);

alter table APPARTENENZA add constraint FKAPP_RIC
     foreign key (CodiceRicambio)
     references RICAMBIO (CodiceRicambio);

alter table FATTURA add constraint FKINTESTAZIONE
     foreign key (CF)
     references PERSONA (CF);

alter table FATTURA add constraint FKEMISSIONE_I
     foreign key (CodiceIntervento)
     references INTERVENTO (CodiceIntervento);

alter table FATTURA add constraint FKEMISSIONE_S
     foreign key (CodiceSessione)
     references SESSIONE (CodiceSessione);

-- Not implemented
-- alter table INTERVENTO add constraint IDINTERVENTO_CHK
--     check(exists(select * from SVOLGIMENTO
--                  where SVOLGIMENTO.CodiceIntervento = CodiceIntervento)); 

alter table INTERVENTO add constraint FKCONSISTENZA
     foreign key (Nome)
     references STATO (Nome);

alter table INTERVENTO add constraint FKEFFETTUAZIONE
     foreign key (NumTelaio)
     references MOTO (NumTelaio);

alter table MOTO add constraint FKREALIZZAZIONE
     foreign key (CodiceModello)
     references MODELLO (CodiceModello);

alter table MOTO add constraint FKPOSSESSIONE
     foreign key (CF)
     references PERSONA (CF);

alter table PRENOTAZIONE add constraint FKCREAZIONE
     foreign key (CF)
     references PERSONA (CF);

-- Not implemented
-- alter table RICAMBIO add constraint IDRICAMBIO_CHK
--     check(exists(select * from APPARTENENZA
--                  where APPARTENENZA.CodiceRicambio = CodiceRicambio)); 

alter table RICAMBIO add constraint FKFORNITURA
     foreign key (CodiceFornitore)
     references FORNITORE (CodiceFornitore);

-- Not implemented
-- alter table SESSIONE add constraint IDSESSIONE_CHK
--     check(exists(select * from AFFIANCAMENTO
--                  where AFFIANCAMENTO.CodiceSessione = CodiceSessione)); 

alter table SESSIONE add constraint FKSVILUPPO
     foreign key (NumTelaio)
     references MOTO (NumTelaio);

alter table STOCCAGGIO add constraint FKSTO_MAG
     foreign key (CodiceMagazzino)
     references MAGAZZINO (CodiceMagazzino);

alter table STOCCAGGIO add constraint FKSTO_RIC
     foreign key (CodiceRicambio)
     references RICAMBIO (CodiceRicambio);

alter table SVOLGIMENTO add constraint FKSVO_PER
     foreign key (CF)
     references PERSONA (CF);

alter table SVOLGIMENTO add constraint FKSVO_INT
     foreign key (CodiceIntervento)
     references INTERVENTO (CodiceIntervento);

alter table UTILIZZO add constraint FKUTI_INT
     foreign key (CodiceIntervento)
     references INTERVENTO (CodiceIntervento);

alter table UTILIZZO add constraint FKUTI_RIC
     foreign key (CodiceRicambio)
     references RICAMBIO (CodiceRicambio);


-- Index Section
-- _____________ 

