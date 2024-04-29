import { getAllPostIds, getPostData } from '../../util/posts';

import  Layout  from '../../components/Layout';


import { Box, Heading, Text, Flex, Divider, extendTheme, ChakraProvider } from '@chakra-ui/react';

const theme = extendTheme({
    styles: {
        global: {
            body: {
                bgGradient: "linear(to-r, orange.200, pink.200)",
                color: "#001443",
              },
            'h1, h2, h3, h4, h5, h6': {
                fontWeight: 'bold',
              },
              'h1': {
                fontSize: '2.25rem', // 36px
                marginTop: '1.5rem',
                marginBottom: '0.75rem',
              },
              'h2': {
                fontSize: '2rem', // 32px
                marginTop: '1.5rem',
                marginBottom: '0.75rem',
              },
              'h3': {
                fontSize: '1.75rem', // 28px
                marginTop: '1.5rem',
                marginBottom: '0.5rem',
              },
              'h4': {
                fontSize: '1.5rem', // 24px
                marginTop: '1.5rem',
                marginBottom: '0.5rem',
              },
              'h5': {
                fontSize: '1.25rem', // 20px
                marginTop: '1.5rem',
                marginBottom: '0.5rem',
              },
              'h6': {
                fontSize: '1rem', // 16px
                marginTop: '1.5rem',
                marginBottom: '0.5rem',
              },
              'p': {
                fontSize: '1rem',
                lineHeight: '1.75rem',
                marginBottom: '1rem',
              },
              'ul, ol': {
                marginLeft: '1.25rem',
                marginBottom: '1rem',
              },
              'li': {
                marginBottom: '0.25rem',
              },
              'a': {
                color: 'black.500',
                textDecoration: 'underline',
              },
              'blockquote': {
                paddingLeft: '1rem',
                borderLeft: '4px solid gray',
                margin: '1rem 0',
                color: 'gray.400',
              },
              'code': {
                fontFamily: 'monospace',
                fontSize: '0.95rem',
                fontWeight: 'bold',
                padding: '0.2rem 0.5rem',
                backgroundColor: 'gray.700',
                borderRadius: '6px',
              },
              'pre': {
                fontFamily: 'monospace',
                overflowX: 'auto',
                padding: '1rem',
                backgroundColor: 'gray.700',
                borderRadius: '6px',
              },
              'table': {
                width: '100%',
                marginBottom: '1rem',
                borderCollapse: 'collapse',
              },
              'th, td': {
                border: '1px solid gray',
                padding: '0.5rem',
                textAlign: 'left',
              },
              'img': {
                maxWidth: '100%',
                height: 'auto',
              },
        },
    },
});



export default function Post({ postData }) {
    if (!postData) {
        console.log("No post data available");
        return <p>No Post Found</p>;
    }

    return (
        <ChakraProvider theme={theme}>
        <Layout>
        <Flex
            minHeight="110vh"  
            width="100%"  
            align="flex-start" 
            justify="center" 
        >
            <Box mt="20" mb="10" textColor="white" bg="black" padding="4" maxW="800px" borderRadius="xl">
                <Heading  size="2xl" marginBottom="2">{postData.id}</Heading>
                <Divider marginBottom="4" />
                <Box dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
            </Box>
        </Flex>
        </Layout>
        </ChakraProvider>
    );
}

export async function getStaticPaths() {
    const paths = getAllPostIds();
    return {
        paths,
        fallback: false,
    };
}

export async function getStaticProps({ params }) {
    const postData = await getPostData(params.id);

    return {
        props: {
            postData,
        },
    };
}
