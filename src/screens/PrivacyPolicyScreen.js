import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';

const PrivacyPolicyScreen = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Política de Privacidade" showBackButton={true} />
      <ScrollView style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Política de Privacidade do Fixa
        </Text>
        <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
          Última atualização: {new Date().toLocaleDateString()}
        </Text>
        
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          A sua privacidade é importante para nós. É política do Fixa respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no aplicativo Fixa.
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          1. Informações que coletamos
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          Coletamos informações pessoais como seu nome e endereço de e-mail quando você se registra no Fixa. Também coletamos dados sobre seu uso do aplicativo, como os decks e cartões que você cria, para fornecer a funcionalidade principal do aplicativo.
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          2. Como usamos suas informações
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          Usamos as informações que coletamos para:
          • Fornecer, operar e manter nosso aplicativo
          • Melhorar, personalizar e expandir nosso aplicativo
          • Entender e analisar como você usa nosso aplicativo
          • Desenvolver novos produtos, serviços, recursos e funcionalidades
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          3. Segurança
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          Valorizamos sua confiança em nos fornecer suas informações pessoais, portanto, estamos nos esforçando para usar meios comercialmente aceitáveis de protegê-las. Mas lembre-se que nenhum método de transmissão pela internet, ou método de armazenamento eletrônico é 100% seguro e confiável, e não podemos garantir sua segurança absoluta.
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          4. Alterações a esta política de privacidade
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          Podemos atualizar nossa Política de Privacidade de tempos em tempos. Assim, recomendamos que você revise esta página periodicamente para quaisquer alterações. Notificaremos você sobre quaisquer alterações publicando a nova Política de Privacidade nesta página.
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          5. Contato
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          Se você tiver alguma dúvida ou sugestão sobre nossa Política de Privacidade, não hesite em nos contatar em contato@fixa-app.com.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
});

export default PrivacyPolicyScreen;