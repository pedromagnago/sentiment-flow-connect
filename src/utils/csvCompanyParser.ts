interface CompanyCSVData {
  taskId: string;
  taskName: string;
  valorMensalidade: string | number;
  assignee: string;
  dueDate: string;
  priority: string;
  status: string;
  prazoDesconto: string | number;
  endereco: string;
  descontoPercentual: string | number;
  aceitarPolitica: string;
  nomeContato: string;
  fonteLead: string;
  cpfRepresentante: string;
  emailRepresentante: string;
  cpfRepresentante2: string;
  cnpj: string;
  emailTestemunha: string;
  nomeRepresentante: string;
  nomeTestemunha: string;
  tipoContrato: string;
  segmento: string;
  nomeEmpresa: string;
  cargo: string;
  whatsappContato: string;
  emailContato: string;
  atividade: string;
  segmento2: string;
  endereco2: string;
  mensalidades: string;
}

export const parseCompanyCSV = (csvText: string) => {
  const lines = csvText.trim().split('\n');
  const companies = [];
  
  console.log('🔍 CSV Parser - Total lines:', lines.length);
  console.log('🔍 CSV Parser - Header:', lines[0]);
  
  // Skip header line and process data
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    console.log(`🔍 Line ${i}: Found ${values.length} values, first few:`, values.slice(0, 5));
    
    if (values.length < 30) {
      console.log(`⚠️ Skipping line ${i} - insufficient columns (${values.length} < 30)`);
      continue; // Skip incomplete lines
    }
    
    const company = {
      // Basic company info
      nome: values[22] || values[1] || '', // Nome da empresa ou task name como fallback
      cnpj: values[16] || '',
      segmento: values[21] || '',
      status: 'ativo', // Default status
      
      // Task/ClickUp related fields
      task_id: values[0] || '',
      task_name: values[1] || '',
      assignee: values[3] || '',
      due_date: parseDueDate(values[4]) || null,
      priority: values[5] || 'none',
      task_status: values[6] || 'ativo',
      
      // Financial info
      valor_mensalidade: parseFloat(values[2]) || 0,
      prazo_desconto: parseInt(values[7]) || 0,
      desconto_percentual: parseFloat(values[9]) || 0,
      aceitar_politica_privacidade: values[10] === 'true',
      
      // Contact info
      nome_contato: values[11] || '',
      fonte_lead: values[12] || '',
      cpf_representante: values[13] || '',
      email_representante: values[14] || '',
      email_testemunha: values[17] || '',
      nome_representante: values[18] || '',
      nome_testemunha: values[19] || '',
      cargo: values[23] || '',
      whatsapp_contato: values[24] || '',
      email_contato: values[25] || '',
      
      // Business info
      tipo_contrato: values[20] || '',
      atividade: values[26] || '',
      endereco: values[8] || values[28] || '', // EndereÃ§o field or EndereÃ§o (short text)
      
      // Integration settings
      clickup_integration_status: 'Inativo',
      omie_integration_status: 'Inativo',
      n8n_integration_active: false,
      
      // Other fields that might be expected
      informacoes_contato: null,
      data_cadastro: null,
      deleted_at: null,
      date_created: null,
      start_date: null,
      date_closed: null,
      linked_docs: null,
      envelope_id: null,
      client_id: null,
      companies_id: null,
      clickup_api_key: null,
      clickup_workspace_id: null,
      omie_api_key: null,
      omie_api_secret: null,
      omie_company_id: null,
      
      // Address fields
      numero: null,
      complemento: null,
      bairro: null,
      cidade: null,
      estado: null,
      cep: null,
      telefone: null,
      email: null,
      responsavel: null,
      cargo_responsavel: null
    };
    
    companies.push(company);
  }
  
  console.log(`✅ CSV Parser - Successfully parsed ${companies.length} companies`);
  console.log('📋 Sample company data:', companies[0]);
  
  return companies;
};

const parseCSVLine = (line: string): string[] => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

const parseDueDate = (dateStr: string): string | null => {
  if (!dateStr || dateStr === '') return null;
  
  try {
    // Handle format like "Monday, June 2nd 2025"
    const match = dateStr.match(/(\w+),\s*(\w+)\s*(\d+)\w*\s*(\d+)/);
    if (match) {
      const [, , month, day, year] = match;
      const monthNames = {
        'January': '01', 'February': '02', 'March': '03', 'April': '04',
        'May': '05', 'June': '06', 'July': '07', 'August': '08',
        'September': '09', 'October': '10', 'November': '11', 'December': '12'
      };
      
      const monthNum = monthNames[month as keyof typeof monthNames];
      if (monthNum) {
        return `${year}-${monthNum}-${day.padStart(2, '0')}`;
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Error parsing date:', dateStr, error);
    return null;
  }
};

// Hardcoded CSV data from the user
export const companyCSVData = `Task ID,"Task Name","Valor da Mensalidade (currency)","Assignee","Due Date","Priority","Status","Prazo do Desconto (number)","EndereÃ§o: (location)","Desconto % (number)","Aceitar a PolÃ­tica de Privacidade e SeguranÃ§a da FullBPO: https://fullbpo.com/politica-de-privacidade-e-seguranca/ (checkbox)","ðŸ'¤ Nome do Contato (short text)","Fonte do Lead (drop down)","CPF do Representante: (short text)","E-mail do Representante (email)","CPF do Representante (short text)","CNPJ (short text)","E-mail da Testemunha (email)","Nome do Representante (short text)","Nome da Testemunha (short text)","Tipo de Contrato (drop down)","Segmento (short text)","ðŸ­ Nome da Empresa (short text)","ðŸ'¼ Cargo (short text)","ðŸ"± Whatsapp do Contato (phone)","âœ‰ï¸ ï¸ E-mail do Contato (email)","Atividade (drop down)","Segmento (drop down)","EndereÃ§o (short text)","Mensalidades (number)"
86a7hc3fy,"CartÃ³rio JF",3800,"[Ellen Soares, Pedro Magnago, Denise Ferreira AraÃºjo]","Monday, June 2nd 2025","HIGH","inativo",12,"",14.45,"true","Vivianne Borges","IndicaÃ§Ã£o","","vivianne@cartoriojf.com.br","87717883104","29561535000113","rodrigo@cartoriojf.com.br","Vivianne Batista Alves Borges","Rodrigo Francco Borge","BPO + Controladoria","Outros","CartÃ³rio JF","ProprietÃ¡ria","+55 32 99902 0999","vivianne@cartoriojf.com.br","ComÃ©rcio","Auditoria e CertificaÃ§Ã£o","",""
86a93b8ck,"Genial",1800,"[Tatiana Mara da Silva Monteiro, Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo]","Wednesday, October 16th 2024","HIGH","inativo","","","","true","MOISES ROMULO DO CARMO","IndicaÃ§Ã£o","121.624.896-60","moisesromulo.jf@gmail.co","121.624.896-60","37.469.528/0001-14","amandinhah.zoe@gmail.com","MOISES ROMULO DO CARMO","Amanda Lima Monteiro","BPO + Controladoria","Varejo","GENIAL COMPANY COMERCIO DE ELETRONICOS LTDA","ProprietÃ¡rio","+55 3291453974","moisesromulo.jf@gmail.co","ComÃ©rcio","Tecnologia","",""
86aaf193n,"Lact Milk",6000,"[Pedro Magnago]","Wednesday, October 22nd 2025","HIGH","inativo",0,"",0,"true","Geraldo Tadeu","IndicaÃ§Ã£o","","Tadeu@lactmilk.com","030.234.256-71","33.565.527/0001-12","","GERALDO TADEU REZENDE GOMES","","Consultoria","IntÃºstria","Lact Milk","ProprietÃ¡rio","+55 32 98877 1000","Tadeu@lactmilk.com","IndÃºstria","AlimentaÃ§Ã£o","Fazenda Santa Brigida, Rodovia RJ-147, 1051, ParapeÃºna / Santa IgnÃ¡cia, ValenÃ§a-RJ, CEP: 27.600-000",3
86a9frz67,"POP360",2500,"[Pedro Magnago, Ellen Soares, Denise Ferreira AraÃºjo]","","none","inativo","","","","","","","","","","","","","","Controladoria","","","","+55","","ServiÃ§o","Financeiro e ContÃ¡bil","",""
86a9bc38j,"SC Nails",2444.26,"[Patricia Terto, Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo]","Thursday, September 18th 2025","none","inativo","","","","","Mara LÃºicia da Silva Coutinho","IndicaÃ§Ã£o","MG-7.796.571","Maracoutinholucia@gmail.com","MG-7.796.571","","","Mara LÃºicia da Silva Coutinho","Thayene da Silva Coutinho","BPO","Manicure","33.299.047 MARA LUCIA DA SILVA COUTINHO","ProprietÃ¡rio","","Maracoutinholucia@gmail.com","ComÃ©rcio","SaÃºde","",""
86a96haau,"Advanced Contabilidade",658.2,"[Denise Ferreira AraÃºjo, Ian Lopes Aarestrup, Pedro Magnago]","","none","ativo",12,"",0,"true","Delton Bastos","IndicaÃ§Ã£o","","deltonbastos@bastosjuris.com.br","092.319.547-50","09.112.299/0001-40","arnaldoloureiro@bastosjuris.com","Delton Pedroso Bastos Junior","Arnaldo Marcelo Loureiro","BPO + Controladoria","ContÃ¡bil","ADVANCED CONTABILIDADE LTDA","Fundador","+55 24 98177 8234","deltonbastos@bastosjuris.com.br","ServiÃ§o","Financeiro e ContÃ¡bil","Rua Presidente Vargas, nÂº 54, Centro, TrÃªs Rios, RJ, CEP: 25.802-200",""
86a9frywv,"Affari",300,"[Pedro Magnago, Denise Ferreira AraÃºjo]","","none","ativo","","","","","","","","","","","","","","Software","","","","+55","","IndÃºstria","Embalagens","",""
86aaxmg4r,"Arteria",1297,"[]","","none","ativo",0,"",0,"true","Tales","Outros","","tales.decarvalho20@gmail.com","125.284.906-07","45.422.716/0001-15","carolsimoesdecarvalho@gmail.com","Tales de Carvalho Silva","Carolina SimÃµes de Carvalho","BPO","EducaÃ§Ã£o","ESCOLA DE CULTURA ARTE E LAZER ARTERIA LTDA","SÃ³cio","+55 32 99828 7047","tales.decarvalho20@gmail.com","ServiÃ§o","EducaÃ§Ã£o","c560d7f1-0260-45de-abc1-6bc6d181eb46",12
86a96hh92,"Bastos e Sampaio",658.2,"[Denise Ferreira AraÃºjo, Ian Lopes Aarestrup, Pedro Magnago]","","none","ativo",12,"",0,"true","Delton Bastos","IndicaÃ§Ã£o","","deltonbastos@bastosjuris.com.br","092.319.547-50","10.757.909/0001-42","arnaldoloureiro@bastosjuris.com","Delton Pedroso Bastos Junior","Arnaldo Marcelo Loureiro","BPO + Controladoria","JurÃ­dico","BASTOS & SAMPAIO ADVOGADOS ASSOCIADOS","Fundador","+55 24 98177 8234","deltonbastos@bastosjuris.com.br","ServiÃ§o","Direito","Rua Pref. Joaquim JosÃ© Ferreira, nÂº 246, Centro, TrÃªs Rios, RJ, CEP: 25.804-020",""
86a96hh4a,"Bastos Juris",658.2,"[Denise Ferreira AraÃºjo, Ian Lopes Aarestrup, Pedro Magnago]","","none","ativo",12,"",0,"true","Delton Bastos","IndicaÃ§Ã£o","","deltonbastos@bastosjuris.com.br","092.319.547-50","44.914.330/0001-68","arnaldoloureiro@bastosjuris.com","Delton Pedroso Bastos Junior","Arnaldo Marcelo Loureiro","BPO + Controladoria","JurÃ­dico","BASTOS JURIS CONSULTORIA LTDA","Fundador","+55 24 98177 8234","deltonbastos@bastosjuris.com.br","ServiÃ§o","Financeiro e ContÃ¡bil","Rua SÃ£o JosÃ©, nÂº 1250, TriÃ¢ngulo, TrÃªs Rios, RJ, CEP: 25820-160",""
86a9bc36e,"Beleza Market",2312.8,"[Helen Arcoverde, Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo]","Thursday, August 20th 2026","none","ativo","","","","","Gabriel Barbosa Xisto","IndicaÃ§Ã£o","052.789.591-18","gabriel@belezamarket.com.br","052.789.591-18","","newton@jpgglobal.com.br","Gabriel Barbosa Xisto","Newton Xisto de Brito Junior","BPO + Controladoria","Marketing","BELEZA MARKET SERVIÃ‡O ESTÃ‰TICA LTDA","ProprietÃ¡rio","","gabriel@belezamarket.com.br","ComÃ©rcio","SaÃºde","",""
86a9fryut,"Campo Bom",3500,"[Pedro Magnago, Ian Lopes Aarestrup]","","none","ativo","","","","","","","","","","","","","","Controladoria","","","","+55","","IndÃºstria","AlimentaÃ§Ã£o","",""
86a9bc2w4,"CPEX",2794,"[Tatiana Mara da Silva Monteiro, Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo, TaynÃ¡ Limas]","Wednesday, March 5th 2025","none","ativo",6,"",15,"","Bruno Simioni Rosa","IndicaÃ§Ã£o","367.484.458-33","bruno.rosa@cpexcert.com.br","367.484.458-33","","rafael@cpexcert.com.br","Bruno Simioni Rosa","Rafael JosÃ© Santos Quintiliano","BPO + Controladoria","Pesquisas","CENTRO DE PESQUISAS EM ATMOSFERAS EXPLOSIVAS LTDA","ProprietÃ¡rio","","bruno.rosa@cpexcert.com.br","ServiÃ§o","Auditoria e CertificaÃ§Ã£o","",""
86a9fryy8,"Credmil",250,"[Pedro Magnago, Denise Ferreira AraÃºjo]","","none","ativo","","","","","","","","","","","","","","Software","","","","+55","","ServiÃ§o","Financeiro e ContÃ¡bil","",""
86aatz3g1,"Cultural Bar","","[Pedro Magnago]","Sunday, January 18th 2026","HIGH","ativo","","","","true","Juliano Rodrigues","Outros","","","","","","","","Consultoria","","Cultural Bar","SÃ³cio Administrador","+55 32 99104 5151","julianoleiterodrigues@gmail.com","ComÃ©rcio","Lazer","",""
86a9bc37a,"CURANTE",1997.6,"[Helen Arcoverde, Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo]","Thursday, August 20th 2026","none","ativo","","","","","Newton Xisto de Brito Junior","IndicaÃ§Ã£o","415.902.951-53","newton@jpgglobal.com.br","415.902.951-53","","","Newton Xisto de Brito Junior","Davi de Oliveira Cameli","BPO + Controladoria","FarmÃ¡cia","CURANTE - FARMÃCIA DE MANIPULAÃ‡ÃƒO LTDA","ProprietÃ¡rio","","newton@jpgglobal.com.br","ComÃ©rcio","SaÃºde","",""
86a9bc2y7,"DIGITAL JPG",672.96,"[Helen Arcoverde, Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo]","","none","ativo","","","","","Newton Xisto de Brito Junior","IndicaÃ§Ã£o","415.902.951-53","newton@jpgglobal.com.br","415.902.951-53","","","Newton Xisto de Brito Junior","Davi de Oliveira Cameli","BPO + Controladoria","CosmÃ©ticos","IN PELE COSMETICOS IMPORTADOS EIRELI","ProprietÃ¡rio","","newton@jpgglobal.com.br","ComÃ©rcio","SaÃºde","",""
86a9bc39v,"Elite MecÃ¢nica",2046.75,"[Denise Ferreira AraÃºjo, Tatiana Mara da Silva Monteiro, Ian Lopes Aarestrup, Pedro Magnago, TaynÃ¡ Limas]","Thursday, November 6th 2025","none","ativo","","","","","Daniel Alberto leismann","IndicaÃ§Ã£o","081.274.129-37","contatoelitemecanica@gmail.com","081.274.129-37","","contatoelitemecanica@gmail.com","Daniel Alberto leismann","Cristina de Oliveira leismann","BPO + Controladoria","Mecanica","ELITE MECANICA LTDA","ProprietÃ¡rio","","contatoelitemecanica@gmail.com","ComÃ©rcio","Transporte","",""
86a93b8c9,"Full BPO","","[Ian Lopes Aarestrup, Denise Ferreira AraÃºjo, Pedro Magnago, Ana Caroline Aquino]","Monday, June 2nd 2025","HIGH","ativo","","","","","","","","","","","","","","BPO + Controladoria","","","","","","ServiÃ§o","Financeiro e ContÃ¡bil","",""
86a93b8d7,"Gaia",4586.31,"[Patricia Terto, Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo]","Friday, June 7th 2024","HIGH","ativo","","","","true","SERGIO RAIMUNDO DA SILVA MARTINS","IndicaÃ§Ã£o","013.920.256-05","sergio.martins@gaiaconsulting.com.br","013.920.256-05","14.796.968/0001-80","jandira.sousa@gaiaconsulting.com.br","SERGIO RAIMUNDO DA SILVA MARTINS","JANDIRA PEREIRA DE SOUSA","BPO + Controladoria","T.I.","GAIA CONSULTING SERVICOS EM TECNOLOGIA DA INFORMACAO LTDA - EPP","ProprietÃ¡rio","+55 3184884180","sergio.martins@gaiaconsulting.com.br","ServiÃ§o","Tecnologia","",""
86a96hh52,"GrowUp ImÃ³veis",658.2,"[Denise Ferreira AraÃºjo, Ian Lopes Aarestrup, Pedro Magnago]","","none","ativo",12,"",0,"true","Delton Bastos","IndicaÃ§Ã£o","","deltonbastos@bastosjuris.com.br","092.319.547-50","27.953.854/0001-49","arnaldoloureiro@bastosjuris.com","Delton Pedroso Bastos Junior","Arnaldo Marcelo Loureiro","BPO + Controladoria","ImobiliÃ¡rio","GROW UP IMÃ"VEIS LTDA","Fundador","+55 24 98177 8234","deltonbastos@bastosjuris.com.br","ServiÃ§o","ImobiliÃ¡rio","Rua Presidente Vargas, nÂº 54, Centro, TrÃªs Rios, RJ, CEP: 25.802-200",""
86a8ywtuu,"IJD ManutenÃ§Ã£o",2497,"[Denise Ferreira AraÃºjo, Ellen Soares, Ian Lopes Aarestrup, Pedro Magnago]","Tuesday, May 26th 2026","none","ativo",3,"",15,"true","Marcus Soares","IndicaÃ§Ã£o","","alessandra@ijdmanutencao.com.br","058.848.176-90","10.705.402/0001-45","thales.ferreira@ijdmanutencao.com.br","Alessandra Salgado do Nascimento","Thales Tauany Paula Ferreira","BPO + Controladoria","ServiÃ§os","IJD SILVA MANUTENÃ‡ÃƒO EIRELI","CEO","+55 21 96440 4462","Marcus@ijdmanutencao.com.br","ServiÃ§o","Infraestrutura","",""
86a9bc2yx,"IN PELE 48",672.96,"[Helen Arcoverde, Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo]","Wednesday, August 20th 2025","none","ativo","","","","","Newton Xisto de Brito Junior","IndicaÃ§Ã£o","415.902.951-53","newton@jpgglobal.com.br","415.902.951-53","","","Newton Xisto de Brito Junior","Davi de Oliveira Cameli","BPO + Controladoria","CosmÃ©ticos","IN PELE COSMETICOS IMPORTADOS EIRELI","ProprietÃ¡rio","","newton@jpgglobal.com.br","ComÃ©rcio","SaÃºde","",""
86a9bc2zn,"IN PELE 95",672.96,"[Helen Arcoverde, Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo]","Wednesday, August 20th 2025","none","ativo","","","","","Newton Xisto de Brito Junior","IndicaÃ§Ã£o","415.902.951-53","newton@jpgglobal.com.br","415.902.951-53","","","Newton Xisto de Brito Junior","Davi de Oliveira Cameli","BPO + Controladoria","CosmÃ©ticos","IN PELE COSMETICOS IMPORTADOS EIRELI","ProprietÃ¡rio","","newton@jpgglobal.com.br","ComÃ©rcio","SaÃºde","",""
86a9bc313,"JPG FILIAL MG",672.96,"[Helen Arcoverde, Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo]","Thursday, August 20th 2026","none","ativo","","","","","Newton Xisto de Brito Junior","IndicaÃ§Ã£o","415.902.951-53","newton@jpgglobal.com.br","415.902.951-53","","","Newton Xisto de Brito Junior","Davi de Oliveira Cameli","BPO + Controladoria","CosmÃ©ticos","IN PELE COSMETICOS IMPORTADOS EIRELI","ProprietÃ¡rio","","newton@jpgglobal.com.br","ComÃ©rcio","SaÃºde","",""
86a9bc31x,"JPG FILIAL SP",672.96,"[Helen Arcoverde, Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo]","Thursday, August 20th 2026","none","ativo","","","","","Newton Xisto de Brito Junior","IndicaÃ§Ã£o","415.902.951-53","newton@jpgglobal.com.br","415.902.951-53","","","Newton Xisto de Brito Junior","Davi de Oliveira Cameli","BPO + Controladoria","CosmÃ©ticos","IN PELE COSMETICOS IMPORTADOS EIRELI","ProprietÃ¡rio","","newton@jpgglobal.com.br","ComÃ©rcio","SaÃºde","",""
86a9bc32d,"JPG GLOBAL",672.96,"[Helen Arcoverde, Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo]","Thursday, August 20th 2026","none","ativo","","","","","Newton Xisto de Brito Junior","IndicaÃ§Ã£o","415.902.951-53","newton@jpgglobal.com.br","415.902.951-53","","","Newton Xisto de Brito Junior","Davi de Oliveira Cameli","BPO + Controladoria","CosmÃ©ticos","IN PELE COSMETICOS IMPORTADOS EIRELI","ProprietÃ¡rio","","newton@jpgglobal.com.br","ComÃ©rcio","SaÃºde","",""
86a93b8c4,"JUMA",4605.19,"[Tatiana Mara da Silva Monteiro, Ian Lopes Aarestrup, TaynÃ¡ Limas, Pedro Magnago, Denise Ferreira AraÃºjo]","Thursday, May 11th 2023","HIGH","ativo","","","","true","Tarcilla Veltuille","IndicaÃ§Ã£o","","tarcilla@juma.bio.br","026.109.281-22","32.042.014/0001-64","financeiro@juma.bio.br","Tarcilla Veltuille de Castro GuimarÃ£es","Giordano CarriÃ£o Torres","BPO + Controladoria","Consultoria Ambiental","JUMA CONSULTORIA AMBIENTAL EIRELI","ProprietÃ¡ria","+55 6182916066","tarcilla@juma.bio.br","ServiÃ§o","Meio Ambiente","",""
86a93b8de,"Juma Car",940.92,"[Tatiana Mara da Silva Monteiro, Ian Lopes Aarestrup, TaynÃ¡ Limas, Pedro Magnago, Denise Ferreira AraÃºjo]","Thursday, May 11th 2023","HIGH","ativo","","","","true","TARCILLA VALTUILLE DE CASTRO GUIMARAES","IndicaÃ§Ã£o","026.109.281-22","tarcilla@juma.bio.br","026.109.281-22","35.224.095/0001-01","financeiro@juma.bio.br","Tarcilla Valtuille de Castro GuimarÃ£es","Giordano CarriÃ£o Torres","BPO + Controladoria","Aluguel de AutomÃ³veis","Jumacar","ProprietÃ¡ria","+55 6182916066","tarcilla@juma.bio.br","ServiÃ§o","Meio Ambiente","",""
86a9bc32y,"LANNIC",672.96,"[Helen Arcoverde, Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo]","Thursday, August 20th 2026","none","ativo","","","","","Newton Xisto de Brito Junior","IndicaÃ§Ã£o","415.902.951-53","newton@jpgglobal.com.br","415.902.951-53","","","Newton Xisto de Brito Junior","Davi de Oliveira Cameli","BPO + Controladoria","CosmÃ©ticos","IN PELE COSMETICOS IMPORTADOS EIRELI","ProprietÃ¡rio","","newton@jpgglobal.com.br","ComÃ©rcio","SaÃºde","",""
86a96hdy2,"Lets Grow",658.2,"[Denise Ferreira AraÃºjo, Ian Lopes Aarestrup, Pedro Magnago]","","none","ativo",12,"",0,"true","Delton Bastos","IndicaÃ§Ã£o","","glaucosampaio@bastosjuris.com.br","092.319.547-50","22.211.479/0001-48","arnaldoloureiro@bastosjuris.com","Glauco Capdeville Fajardo Sampaio","Arnaldo Marcelo Loureiro","BPO + Controladoria","Marketing","BENEFIT SOLUCÃ•ES EMPRESARIAIS E MARKETING LTDA","Fundador","+55 24 98177 8234","glaucosampaio@bastosjuris.com.br","ServiÃ§o","ComunicaÃ§Ã£o e Mkt","Rua SÃ£o JosÃ©, nÂº 1250-D, TriÃ¢ngulo, TrÃªs Rios, RJ, CEP: 25820-160",""
86a9bc3b2,"MaisQ","","[Denise Ferreira AraÃºjo, Ian Lopes Aarestrup, Pedro Magnago, TaynÃ¡ Limas, Team St Peter]","","none","ativo","","","","","","","","","","","","","","BPO + Controladoria","","","","","","ServiÃ§o","Financeiro e ContÃ¡bil","",""
86a9bc2rg,"Modelo Premoldados",1465.03,"[Ian Lopes Aarestrup, Pedro Magnago]","Monday, November 11th 2024","none","ativo",4,"",15,"","Daniel de Menezes Vieira da Silva","IndicaÃ§Ã£o","023.099.901-83","daniel@modelopremoldados.com.br","023.099.901-83","","thamara.siqueira.santos@gmail.com","Daniel de Menezes Vieira da Silva","Thamara Santos Siqueira","Controladoria","Engenharia","Modelo Engenharia e ComÃ©rcio de Premoldados Ltda EPP","ProprietÃ¡rio","","daniel@modelopremoldados.com.br","IndÃºstria","ImobiliÃ¡rio","",""
86a96hh7z,"MPB ParticipaÃ§Ãµes",1697,"[Denise Ferreira AraÃºjo, Ian Lopes Aarestrup, Pedro Magnago]","","none","ativo",12,"",0,"true","Delton Bastos","IndicaÃ§Ã£o","","deltonbastos@bastosjuris.com.br","092.319.547-50","24.745.599/0001-50","arnaldoloureiro@bastosjuris.com","Delton Pedroso Bastos Junior","Arnaldo Marcelo Loureiro","BPO + Controladoria","Holding","MPB PARTICIPAÃ‡Ã•ES E CONSULTORIA LTDA","Fundador","+55 61 98276 3103","deltonbastos@bastosjuris.com.br","ServiÃ§o","ImobiliÃ¡rio","",""
86a93b8dq,"Oito Apoio Administrativo",1432.75,"[Ellen Soares, Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo]","Thursday, June 5th 2025","NORMAL","ativo","","","","","","","","","","","","","","BPO + Controladoria","","","","","","IndÃºstria","AlimentaÃ§Ã£o","",""
86a9frz5j,"PAMA",250,"[Pedro Magnago, Denise Ferreira AraÃºjo]","","none","ativo","","","","","","","","","","","","","","Software","","","","+55","","ServiÃ§o","Financeiro e ContÃ¡bil","",""
86a9frzb6,"Pesadas Joias",124,"[Pedro Magnago, Denise Ferreira AraÃºjo]","","none","ativo","","","","","","","","","","","","","","Software","","","","+55","","ComÃ©rcio","Moda","",""
86a9bc2wx,"Qualitemper",2747,"[Patricia Terto, Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo]","Wednesday, April 9th 2025","none","ativo","","","","","Rosana da Silva","IndicaÃ§Ã£o","049.224.166-09","comercialqualitemperjf2@gmail.com","049.224.166-09","","Brunas2pires@gmail.com","Rosana da Silva","Bruna Silva de Souza","BPO + Controladoria","Blindex","QUALITEMPER ESQUADRIAS E VIDROS LTDA - ME","ProprietÃ¡rio","","comercialqualitemperjf2@gmail.com","IndÃºstria","ImobiliÃ¡rio","",""
86a93b8b6,"Restaurante Industrial",1806.22,"[Tatiana Mara da Silva Monteiro, Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo, TaynÃ¡ Limas]","Sunday, May 7th 2023","HIGH","ativo","","","","true","Simone Cristina Oliveira Borges","IndicaÃ§Ã£o","076.181.606-27","tininhacrisoli@gmail.com","076.181.606-27","26.631.975/0001-01","daniloitagybajr@gmail.com","Simone Cristina Oliveira Borges","Danilo GuimarÃ£es Itagyba Junior","BPO + Controladoria","Restaurante","RESTAURANTE INDUSTRIAL LTDA","ProprietÃ¡ria","+55 3298182200","tininhacrisoli@gmail.com","ComÃ©rcio","AlimentaÃ§Ã£o","",""
86a93b8b4,"SBPNL 33",1689.28,"[Patricia Terto, Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo]","Wednesday, December 13th 2023","HIGH","ativo","","","","true","GILBERTO CRAIDY CURY","IndicaÃ§Ã£o","757.070.558-00","gilberto@pnl.com.br","757.070.558-00","54.321.633/0001-20","meg@pnl.com.br","GILBERTO CRAIDY CURY","Margareth Storer","BPO + Controladoria","Treinamento","Treinamento","ProprietÃ¡rio","+55 11 99715 8098","gilberto@pnl.com.br","ServiÃ§o","EducaÃ§Ã£o","",""
86a93b8dw,"SBPNL 54",1689.28,"[Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo, Patricia Terto]","Wednesday, December 13th 2023","HIGH","ativo","","","","true","GILBERTO CRAIDY CURY","IndicaÃ§Ã£o","757.070.558-00","gilberto@pnl.com.br","757.070.558-00","54.321.633/0001-20","meg@pnl.com.br","GILBERTO CRAIDY CURY","Margareth Storer","BPO + Controladoria","Treinamento","SOCIEDADE BRASILEIRA DE PROGRAMAÃ‡ÃƒO NEUROLINGUÃSTICA S/S LTDA","ProprietÃ¡rio","+55 11 99715 8098","gilberto@pnl.com.br","ServiÃ§o","EducaÃ§Ã£o","",""
86a9bc3ag,"SOMAXI",2897,"[Denise Ferreira AraÃºjo, Tatiana Mara da Silva Monteiro, Ian Lopes Aarestrup, Pedro Magnago, TaynÃ¡ Limas]","Tuesday, January 13th 2026","none","ativo","","","","","PRICILA MACELAI","IndicaÃ§Ã£o","082.208.099-06","pricila@somaxi.com.br","082.208.099-06","","","PRICILA MACELAI","ALLAN ANDRADE PEREIRA MACELAI","BPO + Controladoria","ProteÃ§Ã£o de Dados","SOMAXI FRANQUIAS DE PROTECAO E PRIVACIDADE DE DADOS LTDA","ProprietÃ¡rio","","pricila@somaxi.com.br","ServiÃ§o","Auditoria e CertificaÃ§Ã£o","",""
86a93b8dy,"SSBN ParticipaÃ§Ãµes",1432.75,"[Ellen Soares, Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo]","Tuesday, June 3rd 2025","NORMAL","ativo","","","","","","","","","","","","","","BPO + Controladoria","","","","","","IndÃºstria","AlimentaÃ§Ã£o","",""
86a9bc33h,"STETIC",672.96,"[Helen Arcoverde, Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo]","Thursday, August 20th 2026","none","ativo","","","","","Newton Xisto de Brito Junior","IndicaÃ§Ã£o","415.902.951-53","newton@jpgglobal.com.br","415.902.951-53","","","Newton Xisto de Brito Junior","Davi de Oliveira Cameli","BPO + Controladoria","CosmÃ©ticos","IN PELE COSMETICOS IMPORTADOS EIRELI","ProprietÃ¡rio","","newton@jpgglobal.com.br","ComÃ©rcio","SaÃºde","",""
86a93b8e3,"Sucopira",1432.75,"[Ian Lopes Aarestrup, Ellen Soares, Pedro Magnago, Denise Ferreira AraÃºjo]","Thursday, June 5th 2025","HIGH","ativo","","","","","","","","","","","","","","BPO + Controladoria","","","","","","IndÃºstria","AlimentaÃ§Ã£o","",""
86a9bc34g,"TALENTO",672.96,"[Helen Arcoverde, Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo]","Thursday, August 20th 2026","none","ativo","","","","","Newton Xisto de Brito Junior","IndicaÃ§Ã£o","415.902.951-53","newton@jpgglobal.com.br","415.902.951-53","","","Newton Xisto de Brito Junior","Davi de Oliveira Cameli","BPO + Controladoria","CosmÃ©ticos","IN PELE COSMETICOS IMPORTADOS EIRELI","ProprietÃ¡rio","","newton@jpgglobal.com.br","ComÃ©rcio","SaÃºde","",""
86a9bc2xk,"Terras do Sol",1607,"[Tatiana Mara da Silva Monteiro, TaynÃ¡ Limas, Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo]","Thursday, January 1st 2026","none","ativo","","","","","Adriana Goulart da Rocha","IndicaÃ§Ã£o","007.414.867-25","adriana.terrasdosol@gmail.com","007.414.867-25","","luizagoulartgestao@gmail.com","Adriana Goulart da Rocha","Luiza Goulart Rodrigues","BPO","Condominio ","TERRAS DO SOL INCORPORADORA LTDA","ProprietÃ¡rio","","adriana.terrasdosol@gmail.com","ServiÃ§o","ImobiliÃ¡rio","",""
86a93b8cv,"VEC & DHR & BR",2116.65,"[Patricia Terto, Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo]","Saturday, October 5th 2024","HIGH","ativo","","","","true","Hebert Diogo Machado EgÃ­dio da Costa","IndicaÃ§Ã£o","004.142.891-96","hebert.diogo@vecparticipacoes.com.br","004.142.891-96","04.137.228/0001-89","vecpar@vecparticipacoes.com.br","Hebert Diogo Machado EgÃ­dio da Costa","Altamir EgÃ­dio da Costa","BPO + Controladoria","ImobiliÃ¡rio","DH REALIZACOES IMOBILIARIAS S/A","ProprietÃ¡rio","+55 6181589991","hebert.diogo@vecparticipacoes.com.br","ServiÃ§o","ImobiliÃ¡rio","",""
86a9bc35p,"VIRTUAL JPG",672.96,"[Helen Arcoverde, Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo]","Thursday, August 20th 2026","none","ativo","","","","","Newton Xisto de Brito Junior","IndicaÃ§Ã£o","415.902.951-53","newton@jpgglobal.com.br","415.902.951-53","","","Newton Xisto de Brito Junior","Davi de Oliveira Cameli","BPO + Controladoria","CosmÃ©ticos","IN PELE COSMETICOS IMPORTADOS EIRELI","ProprietÃ¡rio","","newton@jpgglobal.com.br","ComÃ©rcio","SaÃºde","",""
86a93b8d4,"VMF SoluÃ§Ãµes em Bebidas",1432.75,"[Ellen Soares, Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo]","Thursday, June 5th 2025","NORMAL","ativo","","","","","","","","","","","","","","BPO + Controladoria","","","","","","IndÃºstria","AlimentaÃ§Ã£o","",""
86a9bc2vb,"Zunia Entretenimento",1757.5,"[Patricia Terto, Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo]","Saturday, October 5th 2024","none","ativo","","","","","Mariana Madeira de Biase Martins Ferola","IndicaÃ§Ã£o","711270541-04","Mari@mariferola.com.br","711270541-04","","trixfinanceirodf@gmail.com","Mariana Madeira de Biase Martins Ferola","Aurilio Sousa dos Santos","BPO + Controladoria","Casa de Festas","ZUNIA ENTRETENIMENTO LTDA","ProprietÃ¡rio","","Mari@mariferola.com.br","ComÃ©rcio","Lazer","",""
86a9bc2uc,"Zunia MMdeBM",2236.5,"[Patricia Terto, Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo]","Saturday, October 5th 2024","none","ativo","","","","","Mariana Madeira de Biase Martins Ferola","IndicaÃ§Ã£o","711270541-04","Mari@mariferola.com.br","711270541-04","","trixfinanceirodf@gmail.com","Mariana Madeira de Biase Martins Ferola","Aurilio Sousa dos Santos","BPO + Controladoria","Casa de Festas","M . M. DE B. M. FEROLA FESTAS E EVENTOS","ProprietÃ¡rio","","Mari@mariferola.com.br","ComÃ©rcio","Lazer","",""
86a9bc2tu,"Zunia Trix",1097,"[Patricia Terto, Ian Lopes Aarestrup, Pedro Magnago, Denise Ferreira AraÃºjo]","Saturday, October 5th 2024","none","ativo","","","","","Mariana Madeira de Biase Martins Ferola","IndicaÃ§Ã£o","711270541-04","Mari@mariferola.com.br","711270541-04","","trixfinanceirodf@gmail.com","Mariana Madeira de Biase Martins Ferola","Aurilio Sousa dos Santos","BPO + Controladoria","Casa de Festas","ESPACO TRIX BRINQUEDOTECA E CASA DE FESTAS LTDA","ProprietÃ¡rio","","Mari@mariferola.com.br","ComÃ©rcio","Lazer","",""
86aaxmg8w,"Brasil Clean",1097,"[]","","none","to do",0,"",0,"true","Everton Ferreira ","IndicaÃ§Ã£o","","everton@brasilcleandesentupidora.com.br","05622124697","44.908.293/0001-85","emerson@brasilcleandesentupidora.com.br","Everton Ferreira ","Emerson Ferreira ","BPO + Controladoria","Limpeza"," EMERSON FERREIRA 69013683649","PropietÃ¡rio","+55 3187195931","everton@brasilcleandesentupidora.com.br","ServiÃ§o","Infraestrutura"," AVENIDA AV TUNICO REIS, 770, SETE LAGOAS",""`;